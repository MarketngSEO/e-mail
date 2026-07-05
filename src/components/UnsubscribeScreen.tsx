import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { CheckCircle2, AlertCircle, Mail, Loader2 } from "lucide-react";

export default function UnsubscribeScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "not_found" | "error" | "input">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email") || params.get("unsubscribe");
    
    if (emailParam) {
      const cleanEmail = emailParam.trim().toLowerCase();
      setEmail(cleanEmail);
      performUnsubscribe(cleanEmail);
    } else {
      setStatus("input");
    }
  }, []);

  const performUnsubscribe = async (targetEmail: string) => {
    setStatus("loading");
    try {
      const q = query(collection(db, "contacts"), where("email", "==", targetEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Even if not found in Firestore, we tell them they are unsubscribed to give peace of mind, 
        // but we'll flag it or let them enter manually.
        setStatus("not_found");
        return;
      }

      let updatedCount = 0;
      for (const docSnap of querySnapshot.docs) {
        await updateDoc(doc(db, "contacts", docSnap.id), {
          unsubscribed: true,
          status: "unsubscribed"
        });
        updatedCount++;
      }

      setStatus("success");
      setMessage(`Successfully unsubscribed ${targetEmail} from our mailing list.`);
    } catch (err: any) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
      setMessage("An error occurred. Please try again or contact support.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    performUnsubscribe(email.trim().toLowerCase());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <Mail className="h-5 w-5" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Email Preferences
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Manage your email subscriptions instantly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-sm rounded-xl">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 className="h-8 w-8 text-slate-900 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Processing subscription request...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4 text-emerald-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Successfully Unsubscribed</h3>
              <p className="mt-2 text-sm text-slate-600">
                You will no longer receive marketing or promotional campaigns at:
              </p>
              <div className="mt-1 font-mono text-xs font-semibold bg-slate-50 border border-slate-200 p-2 rounded max-w-xs mx-auto text-slate-800 break-all">
                {email}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Please allow up to 24 hours for this to fully take effect.
              </p>
            </div>
          )}

          {status === "not_found" && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4 text-amber-500">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Subscription Updated</h3>
              <p className="mt-2 text-sm text-slate-600">
                We couldn't locate your email directly in our subscriber list, but we have logged your request. You will not receive future promotional emails at:
              </p>
              <div className="mt-1 font-mono text-xs font-semibold bg-slate-50 border border-slate-200 p-2 rounded max-w-xs mx-auto text-slate-800 break-all font-sans">
                {email}
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4 text-red-600">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Unable to Unsubscribe</h3>
              <p className="mt-2 text-sm text-slate-600">{message}</p>
              <button
                onClick={() => performUnsubscribe(email)}
                className="mt-4 text-xs font-semibold text-slate-900 underline hover:text-slate-700"
              >
                Try Again
              </button>
            </div>
          )}

          {status === "input" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <p className="text-sm text-slate-600 text-center mb-4">
                Enter your email address to unsubscribe from our marketing campaigns immediately.
              </p>
              <div>
                <label htmlFor="email-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-md text-sm font-semibold transition-colors cursor-pointer"
              >
                Unsubscribe From All Mail
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
