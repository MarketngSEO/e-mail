import React, { useState } from "react";
import { Send, Sparkles, Loader2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Contact } from "../types";

interface CampaignComposerProps {
  selectedContacts: Contact[];
  onSendCampaign: (subject: string, content: string, recipients: string[]) => Promise<{
    total: number;
    success: number;
    failed: number;
    details: Array<{ email: string; success: boolean; error?: string }>;
  }>;
  isDemo?: boolean;
  onLogin?: () => void;
}

// Inline ready-to-use, gorgeous email marketing templates with NO gradients
const TEMPLATES = [
  {
    name: "Summer Coupon Deal",
    subject: "🔥 Exclusive Deal: 20% OFF Everything inside!",
    content: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 40px 30px;">
    <tr>
      <td>
        <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px; text-align: center;">SUMMER FLASH SALE</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; text-align: center;">We are excited to share a special treat with you. Use the coupon code below to unlock amazing savings across our entire catalogue.</p>
        
        <!-- Promo Coupon Box -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto; width: 100%; max-width: 320px;">
          <tr>
            <td align="center" style="background-color: #0f172a; padding: 20px; border-radius: 6px;">
              <span style="font-size: 12px; font-weight: 600; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase;">YOUR COUPON CODE</span>
              <div style="font-size: 28px; font-weight: bold; color: #ffffff; font-family: monospace; margin: 8px 0;">SUMMER20</div>
              <span style="font-size: 12px; color: #cbd5e1;">Valid for the next 48 hours only!</span>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px; text-align: center;">Click the link below to automatically apply the code at checkout.</p>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="#" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; display: inline-block;">Shop Campaign Sale Now</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8; line-height: 1.4;">
          You received this promotional email because you are registered in our customer portal. To stop receiving these, you can click <a href="#" style="color: #64748b; text-decoration: underline;">unsubscribe</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    name: "New Product Launch",
    subject: "✨ Introducing Our Brand New Product!",
    content: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 40px 30px;">
    <tr>
      <td>
        <span style="font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase; display: block; text-align: center; margin-bottom: 8px;">PRODUCT RELEASE</span>
        <h1 style="font-size: 26px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 16px; text-align: center;">IT IS FINALLY HERE</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Our engineering and design teams have been working tirelessly for months, and we are proud to introduce our most advanced product to date.</p>
        
        <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 30px; margin-bottom: 12px;">What is new?</h3>
        <ul style="font-size: 15px; line-height: 1.6; padding-left: 20px; color: #334155;">
          <li style="margin-bottom: 10px;"><strong>Ultra-Fast Core Engine:</strong> Up to 3x speed increase compared to previous generation.</li>
          <li style="margin-bottom: 10px;"><strong>Minimalist Layout Mode:</strong> Focused on clean styling, spacious margins, and high readability.</li>
          <li style="margin-bottom: 10px;"><strong>Embedded integrations:</strong> Easily collect emails and mobile data across separate portals.</li>
        </ul>
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 30px;">
          <a href="#" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; display: inline-block;">Explore Feature List</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8; line-height: 1.4;">
          This message is intended for active subscribers of our marketing lists. Unsubscribe anytime by clicking <a href="#" style="color: #64748b; text-decoration: underline;">here</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    name: "Simple Plain Text Announce",
    subject: "📢 Quick Update regarding your account",
    content: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #ffffff; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; line-height: 1.6; font-size: 15px;">
    <p>Hi there,</p>
    
    <p>We wanted to send you a quick, direct update. Over the past few weeks, we've implemented several system-wide improvements to our email collection and campaign orchestration platforms.</p>
    
    <p>We are dedicated to providing the cleanest, most responsive, and simple email and mobile list building experiences possible.</p>
    
    <p>If you have any feedback or ideas on how we can improve, please don't hesitate to reply directly to this email!</p>
    
    <p style="margin-top: 40px; margin-bottom: 0;">Warm regards,</p>
    <p style="margin-top: 4px; font-weight: bold;">The Marketing Team</p>
    
    <p style="margin-top: 50px; font-size: 11px; color: #94a3b8;">
      If you no longer wish to receive these updates, you can <a href="#" style="color: #94a3b8;">unsubscribe</a>.
    </p>
  </div>
</body>
</html>`
  }
];

export default function CampaignComposer({
  selectedContacts,
  onSendCampaign,
  isDemo = false,
  onLogin
}: CampaignComposerProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    details: Array<{ email: string; success: boolean; error?: string }>;
  } | null>(null);

  // Filter contacts with actual email addresses
  const eligibleContacts = selectedContacts.filter((c) => c.email && !c.unsubscribed);

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleSend = async () => {
    if (isDemo && onLogin) {
      onLogin();
      return;
    }
    if (!subject.trim()) {
      alert("Please enter an email subject line.");
      return;
    }
    if (!content.trim()) {
      alert("Please write some promotional email body content.");
      return;
    }
    if (eligibleContacts.length === 0) {
      alert("No valid email subscribers are checked in your contacts list.");
      return;
    }

    setSending(true);
    setStatus("sending");
    setResults(null);

    const emailList = eligibleContacts.map((c) => c.email!);

    try {
      const response = await onSendCampaign(subject.trim(), content.trim(), emailList);
      setResults(response);
      setStatus(response.failed === 0 ? "success" : "error");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setContent("");
    setResults(null);
    setStatus("idle");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <Send className="h-5 w-5 text-slate-700" />
          Compose Promotional Campaign
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Design your campaign with solid layouts and send instantly to all checked subscribers.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Templates Panel */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Instant Solid HTML Templates
          </span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                id={`template-${idx}`}
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email-subject" className="block text-sm font-medium text-slate-700 mb-1">
              Email Subject Line
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Summer Launch: Here is what's new"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm transition-all"
            />
          </div>

          <div>
            <label htmlFor="email-body" className="block text-sm font-medium text-slate-700 mb-1">
              Promotional Email Body (HTML support)
            </label>
            <textarea
              id="email-body"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h1>Your Announcement</h1><p>Type HTML or text here...</p>"
              rows={12}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 text-sm font-mono transition-all"
            />
          </div>
        </div>

        {/* Sending Controls & Target info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg gap-4">
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800 text-sm">
              Target Audience
            </p>
            <p className="mt-0.5">
              Your promotional email will be sent to{" "}
              <strong className="text-slate-950 font-semibold">{eligibleContacts.length}</strong> of{" "}
              <strong className="text-slate-950 font-semibold">{selectedContacts.length}</strong> checked subscribers with valid emails.
            </p>
          </div>

          <div className="flex gap-2.5">
            {status !== "idle" && status !== "sending" && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                id="campaign-composer-reset-btn"
              >
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || (eligibleContacts.length === 0 && !isDemo)}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                isDemo
                  ? "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                  : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              }`}
              id="send-campaign-submit-btn"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Mail...</span>
                </>
              ) : isDemo ? (
                <>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Sign in with Google to Send</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Promotional Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Screen */}
        {results && (
          <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                results.failed === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {results.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold text-sm">
                  {results.failed === 0 ? "Campaign Successfully Delivered!" : "Campaign Completed with Errors"}
                </h4>
                <p className="text-xs mt-1">
                  Sent a total of <strong>{results.total}</strong> emails. Successes:{" "}
                  <strong>{results.success}</strong>, Failures: <strong>{results.failed}</strong>.
                </p>
              </div>
            </div>

            {/* Recipients Send Ledger */}
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Detailed Delivery Logs
              </span>
              <div className="border border-slate-200 rounded-md overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 font-medium">Recipient Email</th>
                      <th className="p-2.5 font-medium">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.details.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono">{item.email}</td>
                        <td className="p-2.5 font-medium">
                          {item.success ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700">
                              Error: {item.error || "Gmail Send Failure"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
