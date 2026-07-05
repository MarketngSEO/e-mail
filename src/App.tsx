import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { auth, db, googleSignIn, logout, initAuth } from "./lib/firebase";
import { Contact, Campaign, ConfigInfo } from "./types";

// Import components
import LoginScreen from "./components/LoginScreen";
import ContactTable from "./components/ContactTable";
import ContactForm from "./components/ContactForm";
import CampaignComposer from "./components/CampaignComposer";
import IntegrationSnippet from "./components/IntegrationSnippet";

// Import icons
import {
  Users,
  Smartphone,
  Mail,
  Send,
  Code2,
  LogOut,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";

const MOCK_CONTACTS: Contact[] = [
  { id: "mock-1", email: "johndoe@gmail.com", phone: "+1 (555) 123-4567", source: "my-ecommerce-shop.com", timestamp: Date.now() - 3600000 * 12, status: "active", unsubscribed: false },
  { id: "mock-2", email: "sarah.smith@yahoo.com", phone: "+1 (555) 987-6543", source: "newsletter-signup-box", timestamp: Date.now() - 3600000 * 48, status: "active", unsubscribed: false },
  { id: "mock-3", email: "mike_marketing@hotmail.com", phone: null, source: "Manual Import", timestamp: Date.now() - 3600000 * 120, status: "active", unsubscribed: false },
  { id: "mock-4", email: "alex.jones@outlook.com", phone: "+1 (415) 555-2671", source: "mobile-app-sync", timestamp: Date.now() - 3600000 * 150, status: "unsubscribed", unsubscribed: true },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "mock-camp-1", subject: "🔥 Exclusive Deal: 20% OFF Everything inside!", content: "", sentAt: new Date(Date.now() - 3600000 * 24).toISOString(), recipientsCount: 3, successCount: 3, failedCount: 0, status: "sent" },
  { id: "mock-camp-2", subject: "✨ Introducing Our Brand New Product!", content: "", sentAt: new Date(Date.now() - 3600000 * 72).toISOString(), recipientsCount: 4, successCount: 4, failedCount: 0, status: "sent" },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core business collections states initialized with mock data
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(
    new Set(MOCK_CONTACTS.filter((c) => !c.unsubscribed).map((c) => c.id))
  );

  // Configuration from the Express backend
  const [config, setConfig] = useState<ConfigInfo | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "compose" | "integration">("dashboard");

  // Fetch app config on load
  useEffect(() => {
    fetch("/api/config")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load server configuration");
        return res.json();
      })
      .then((data) => setConfig(data))
      .catch((err) => console.error("Config fetch error:", err));
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        setLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
        setLoading(false);
        setContacts(MOCK_CONTACTS);
        setCampaigns(MOCK_CAMPAIGNS);
        setSelectedContactIds(new Set(MOCK_CONTACTS.filter((c) => !c.unsubscribed).map((c) => c.id)));
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of subscriber contacts from Firestore (only if logged in)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contactsList: Contact[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          contactsList.push({
            id: doc.id,
            email: data.email || null,
            phone: data.phone || null,
            source: data.source || "Unknown",
            timestamp: data.timestamp || Date.now(),
            status: data.status || "active",
            unsubscribed: !!data.unsubscribed
          } as Contact);
        });

        setContacts(contactsList);

        // Auto check newly synced active contacts
        setSelectedContactIds((prev) => {
          const next = new Set(prev);
          contactsList.forEach((c) => {
            if (!c.unsubscribed) {
              next.add(c.id);
            }
          });
          return next;
        });
      },
      (err) => {
        console.error("Firestore listening error for contacts:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time synchronization of campaigns list from Firestore (only if logged in)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "campaigns"), orderBy("sentAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const campaignsList: Campaign[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          campaignsList.push({
            id: doc.id,
            subject: data.subject || "No Subject",
            content: data.content || "",
            sentAt: data.sentAt || "",
            recipientsCount: data.recipientsCount ? Number(data.recipientsCount) : 0,
            successCount: data.successCount ? Number(data.successCount) : 0,
            failedCount: data.failedCount ? Number(data.failedCount) : 0,
            status: data.status || "sent"
          } as Campaign);
        });
        setCampaigns(campaignsList);
      },
      (err) => {
        console.error("Firestore listening error for campaigns:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Login Button Click
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Failed to sign in. Please allow Google Popups and accept scopes.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout Button Click
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Action: Manually Add a Contact
  const handleAddContact = async (email: string, phone: string, source: string) => {
    await addDoc(collection(db, "contacts"), {
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      source: source || "Manual Import",
      timestamp: Date.now(),
      status: "active",
      unsubscribed: false
    });
  };

  // Action: Toggle Checkbox for a Contact
  const handleToggleContact = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Action: Toggle Checkbox for ALL Contacts
  const handleToggleAllContacts = (checked: boolean) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      contacts.forEach((c) => {
        if (!c.unsubscribed) {
          if (checked) {
            next.add(c.id);
          } else {
            next.delete(c.id);
          }
        }
      });
      return next;
    });
  };

  // Action: Delete a Contact document
  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber completely?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      setSelectedContactIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Failed to delete contact:", err);
      alert("Error deleting contact");
    }
  };

  // Action: Toggle Subscription Opt-Out Status (Unsubscribe)
  const handleToggleUnsubscribe = async (id: string, currentlyUnsubscribed: boolean) => {
    try {
      await updateDoc(doc(db, "contacts", id), {
        unsubscribed: !currentlyUnsubscribed,
        status: !currentlyUnsubscribed ? "unsubscribed" : "active"
      });
      // If unsubscribing, deselect it from active targets list
      if (!currentlyUnsubscribed) {
        setSelectedContactIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to unsubscribe contact:", err);
      alert("Error toggling subscription state");
    }
  };

  // Action: Send Marketing Campaign via custom Node server proxy
  const handleSendCampaign = async (subject: string, content: string, recipients: string[]) => {
    if (!token) {
      throw new Error("Authentication token is missing. Please sign in again.");
    }

    const res = await fetch("/api/send-campaign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ subject, content, recipients })
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = "Failed to transmit campaign";
      try {
        const data = JSON.parse(text);
        if (data.message) msg = data.message;
      } catch (e) {}
      throw new Error(msg);
    }

    return await res.json();
  };

  // Calculate general stats
  const totalSubscribers = contacts.length;
  const emailsCount = contacts.filter((c) => c.email).length;
  const phonesCount = contacts.filter((c) => c.phone).length;
  const sentCampaignsCount = campaigns.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="text-sm font-medium text-slate-500">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // No early return for unsigned users anymore, we let them see the website first!

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Admin App Banner Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Campaigner</h1>
                <p className="text-[10px] text-slate-400 font-medium">Simple Email Marketing Portal</p>
              </div>
            </div>

             {/* Profile Sign-out Details or Google Login Button */}
             <div className="flex items-center space-x-4">
               {user ? (
                 <>
                   <div className="hidden sm:block text-right">
                     <div className="text-xs font-semibold">{user.displayName || "Marketing Manager"}</div>
                     <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                   </div>
                   {user.photoURL ? (
                     <img
                       src={user.photoURL}
                       alt={user.displayName || "Manager Avatar"}
                       className="h-8 w-8 rounded-full border border-slate-700"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                       {(user.displayName || "M").charAt(0)}
                     </div>
                   )}
                   <button
                     onClick={handleLogout}
                     className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                     id="header-logout-btn"
                     title="Sign Out"
                   >
                     <LogOut className="h-4 w-4" />
                   </button>
                 </>
               ) : (
                 <button
                   onClick={handleLogin}
                   disabled={isLoggingIn}
                   className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-4 py-2 rounded text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
                   id="header-login-btn"
                 >
                   <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                     <path
                       fill="#4285F4"
                       d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61a5.66 5.66 0 0 1-2.45 3.71v3.08h3.95c2.31-2.13 3.63-5.27 3.63-8.64z"
                     />
                     <path
                       fill="#34A853"
                       d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.95-3.08c-1.1.74-2.5 1.18-3.98 1.18-3.06 0-5.64-2.07-6.57-4.85H1.4v3.18C3.38 21.35 7.42 24 12 24z"
                     />
                     <path
                       fill="#FBBC05"
                       d="M5.43 14.34a7.14 7.14 0 0 1 0-4.59V6.57H1.4a11.96 11.96 0 0 0 0 10.95l4.03-3.18z"
                     />
                     <path
                       fill="#EA4335"
                       d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.93 1.19 15.24 0 12 0 7.42 0 3.38 2.65 1.4 6.57l4.03 3.18c.93-2.78 3.51-4.85 6.57-4.85z"
                     />
                   </svg>
                   <span>{isLoggingIn ? "Signing in..." : "Sign in with Google"}</span>
                 </button>
               )}
             </div>
          </div>
        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Guest mode warning banner */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded mt-0.5">
                <AlertCircle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">Guest Mode Playground</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  You are currently viewing Campaigner in <strong>Guest Mode</strong>. To record real emails, sync subscribers automatically across separate domains, and launch marketing campaigns via your business Gmail, please connect your Google account.
                </p>
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="shrink-0 bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-semibold py-2 px-4 rounded cursor-pointer shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="white"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61a5.66 5.66 0 0 1-2.45 3.71v3.08h3.95c2.31-2.13 3.63-5.27 3.63-8.64z"
                />
                <path
                  fill="white"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.95-3.08c-1.1.74-2.5 1.18-3.98 1.18-3.06 0-5.64-2.07-6.57-4.85H1.4v3.18C3.38 21.35 7.42 24 12 24z"
                />
                <path
                  fill="white"
                  d="M5.43 14.34a7.14 7.14 0 0 1 0-4.59V6.57H1.4a11.96 11.96 0 0 0 0 10.95l4.03-3.18z"
                />
                <path
                  fill="white"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.93 1.19 15.24 0 12 0 7.42 0 3.38 2.65 1.4 6.57l4.03 3.18c.93-2.78 3.51-4.85 6.57-4.85z"
                />
              </svg>
              <span>{isLoggingIn ? "Connecting..." : "Connect Google Account"}</span>
            </button>
          </div>
        )}

        {/* Auth Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between text-xs font-semibold">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-red-950 font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs Area */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "border-slate-900 text-slate-900 bg-slate-100/50"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
            id="nav-tab-dashboard"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Dashboard & Contacts</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "compose"
                ? "border-slate-900 text-slate-900 bg-slate-100/50"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
            id="nav-tab-compose"
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Compose Campaign</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("integration")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "integration"
                ? "border-slate-900 text-slate-900 bg-slate-100/50"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
            id="nav-tab-integration"
          >
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span>Integrations Embed</span>
            </div>
          </button>
        </div>

        {/* Overview Stats Dashboard Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Subscribers</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalSubscribers}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-slate-700">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Emails Recorded</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{emailsCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-slate-700">
              <Mail className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Phones Recorded</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{phonesCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-slate-700">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Campaigns Sent</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{sentCampaignsCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-slate-700">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection Renderer */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left lists & actions Column */}
            <div className="lg:col-span-2 space-y-6">
              <ContactTable
                contacts={contacts}
                selectedContactIds={selectedContactIds}
                onToggleContact={handleToggleContact}
                onToggleAllContacts={handleToggleAllContacts}
                onDeleteContact={handleDeleteContact}
                onToggleUnsubscribe={handleToggleUnsubscribe}
                isDemo={!user}
                onLogin={handleLogin}
              />
            </div>

            {/* Right sidebar Column */}
            <div className="space-y-6">
              <ContactForm 
                onAddContact={handleAddContact} 
                isDemo={!user}
                onLogin={handleLogin}
              />

              {/* Historical Campaigns Logs */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-slate-700" />
                  Campaign History Logs
                </h3>
                {campaigns.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No historical campaigns recorded yet.</p>
                ) : (
                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {campaigns.map((camp) => (
                      <div key={camp.id} className="border border-slate-100 p-3 rounded bg-slate-50/50 text-xs hover:border-slate-300 transition-colors">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="truncate pr-2">{camp.subject}</span>
                          <span className="shrink-0 text-slate-400 font-mono font-normal">
                            {new Date(camp.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span>Audience Size: <strong>{camp.recipientsCount}</strong></span>
                          <span>Delivered: <strong className="text-emerald-700">{camp.successCount}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "compose" && (
          <CampaignComposer
            selectedContacts={contacts.filter((c) => selectedContactIds.has(c.id))}
            onSendCampaign={handleSendCampaign}
            isDemo={!user}
            onLogin={handleLogin}
          />
        )}

        {activeTab === "integration" && (
          <IntegrationSnippet 
            config={config} 
            isDemo={!user}
            onLogin={handleLogin}
          />
        )}
      </main>
    </div>
  );
}
