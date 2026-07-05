import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface ContactFormProps {
  onAddContact: (email: string, phone: string, source: string) => Promise<void>;
  isDemo?: boolean;
  onLogin?: () => void;
}

export default function ContactForm({ onAddContact, isDemo = false, onLogin }: ContactFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("Manual Import");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo && onLogin) {
      onLogin();
      return;
    }
    if (!email && !phone) {
      setMessage({ type: "error", text: "Please enter at least an email or phone number." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await onAddContact(email.trim(), phone.trim(), source.trim());
      setMessage({ type: "success", text: "Subscriber successfully registered!" });
      setEmail("");
      setPhone("");
      setSource("Manual Import");
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to add subscriber." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2 mb-4">
        <Plus className="h-5 w-5 text-slate-700" />
        Record New Subscriber
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="manual-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address (Optional)
          </label>
          <input
            id="manual-email"
            type="email"
            placeholder="customer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm transition-all"
          />
        </div>

        <div>
          <label htmlFor="manual-phone" className="block text-sm font-medium text-slate-700 mb-1">
            Mobile Number (Optional)
          </label>
          <input
            id="manual-phone"
            type="tel"
            placeholder="+1 (555) 019-9000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm transition-all"
          />
        </div>

        <div>
          <label htmlFor="manual-source" className="block text-sm font-medium text-slate-700 mb-1">
            Traffic Source
          </label>
          <select
            id="manual-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm transition-all bg-white"
          >
            <option value="Manual Import">Manual Entry</option>
            <option value="Direct Call">Direct Lead</option>
            <option value="CSV Upload">CSV Bulk Import</option>
            <option value="Newsletter Sign-up">Newsletter Box</option>
          </select>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded text-xs border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isDemo 
              ? "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200" 
              : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          }`}
          id="add-subscriber-submit-btn"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isDemo ? (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Sign in with Google to Add</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Subscriber</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
