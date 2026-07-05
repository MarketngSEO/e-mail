import React, { useState } from "react";
import { Code2, Check, Copy, Terminal, Smartphone, Mail, Globe, Shield, Sparkles } from "lucide-react";
import { ConfigInfo } from "../types";

interface IntegrationSnippetProps {
  config: ConfigInfo | null;
  isDemo?: boolean;
  onLogin?: () => void;
}

export default function IntegrationSnippet({ config, isDemo = false, onLogin }: IntegrationSnippetProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"universal" | "manual" | "curl">("universal");

  const appUrl = config?.appUrl || "https://your-marketing-app.run.app";
  const apiKey = isDemo ? "marketing_key_demo_playground_connect_google" : (config?.apiKey || "marketing_key_default_99");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const universalSnippet = `<!-- 🚀 Campaigner Universal Auto-Capture Pixel -->
<!-- Copy & Paste this script right before the closing </head> or </body> tag of your website. -->
<script>
  (function() {
    // Initialize Campaigner Tracking SDK
    window.Campaigner = {
      appUrl: '${appUrl}',
      apiKey: '${apiKey}',
      trackEmail: function(email, additionalData) {
        if (!email || !email.includes('@')) return;
        fetch(this.appUrl + '/api/collect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          body: JSON.stringify({
            email: email,
            phone: additionalData?.phone || null,
            source: additionalData?.source || window.location.hostname || 'Auto-Capture Pixel'
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) { console.log('Campaigner synced subscriber:', data); })
        .catch(function(err) { console.error('Campaigner sync failed:', err); });
      }
    };

    // 🌟 Autocapture Engine: Automatically intercepts all login/signup form submissions
    document.addEventListener('submit', function(event) {
      try {
        var form = event.target;
        var inputs = form.getElementsByTagName('input');
        var emailValue = '';
        var phoneValue = '';

        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];
          var type = input.getAttribute('type') || '';
          var name = input.getAttribute('name') || '';
          var id = input.getAttribute('id') || '';
          var val = input.value || '';

          // Smart matching for email fields
          if (type.toLowerCase() === 'email' || name.toLowerCase().indexOf('email') !== -1 || id.toLowerCase().indexOf('email') !== -1) {
            if (val.indexOf('@') !== -1) {
              emailValue = val.trim();
            }
          }
          // Smart matching for phone numbers
          if (type.toLowerCase() === 'tel' || name.toLowerCase().indexOf('phone') !== -1 || id.toLowerCase().indexOf('phone') !== -1) {
            phoneValue = val.trim();
          }
        }

        // If we captured an email, sync it automatically
        if (emailValue) {
          var formIdentifier = form.getAttribute('id') || form.getAttribute('class') || 'Website Form';
          window.Campaigner.trackEmail(emailValue, {
            phone: phoneValue || null,
            source: window.location.hostname + ' (' + formIdentifier.split(' ')[0] + ')'
          });
        }
      } catch (err) {
        console.error('Campaigner listener error:', err);
      }
    });
  })();
</script>`;

  const manualSnippet = `<!-- Campaigner Manual Tracking Hook -->
<!-- Call this Javascript function explicitly anywhere in your login callbacks, auth states, or router -->
<script>
  function syncLoggedInUser(emailAddress, phoneNumber) {
    fetch('${appUrl}/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}'
      },
      body: JSON.stringify({
        email: emailAddress,
        phone: phoneNumber || null,
        source: window.location.hostname + ' (Auth State Sync)'
      })
    })
    .then(response => response.json())
    .then(data => console.log('Active user recorded:', data))
    .catch(error => console.error('Failed to sync active session:', error));
  }

  // Example: Hook into Firebase Auth state change or standard React login callbacks
  // firebase.auth().onAuthStateChanged(function(user) {
  //   if (user && user.email) {
  //     syncLoggedInUser(user.email, user.phoneNumber);
  //   }
  // });
</script>`;

  const curlSnippet = `# Direct REST API POST to record user session email
curl -X POST "${appUrl}/api/collect" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "email": "customer@yourdomain.com",
    "phone": "+1234567890",
    "source": "My Main Web Server"
  }'`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900 text-white rounded">
            <Code2 className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Extract & Sync Logged-In User Emails
          </h3>
        </div>
        <p className="mt-1.5 text-xs text-slate-500 max-w-2xl leading-relaxed">
          Embed these lightweight codes into your other personal websites. It captures user inputs or state sessions automatically and uploads them to your marketing contacts dashboard in real-time.
        </p>
      </div>

      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab("universal")}
          className={`flex-1 py-3 px-4 text-center border-b-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "universal"
              ? "border-slate-900 text-slate-900 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
          id="tab-universal-integration"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Universal Auto-Capture (Recommended)
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-3 px-4 text-center border-b-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "manual"
              ? "border-slate-900 text-slate-900 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
          id="tab-manual-integration"
        >
          <Mail className="h-3.5 w-3.5" />
          Auth Hooks / JS API
        </button>
        <button
          onClick={() => setActiveTab("curl")}
          className={`flex-1 py-3 px-4 text-center border-b-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "curl"
              ? "border-slate-900 text-slate-900 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
          id="tab-curl-integration"
        >
          <Terminal className="h-3.5 w-3.5" />
          Backend API / cURL
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            {activeTab === "universal" && "🚀 Universal Forms Auto-Capture Script (No Code modification needed)"}
            {activeTab === "manual" && "⚙️ Custom Login Callback Function"}
            {activeTab === "curl" && "🔌 Backend API Example"}
          </span>
          <button
            onClick={() => {
              const text = activeTab === "universal" ? universalSnippet : activeTab === "manual" ? manualSnippet : curlSnippet;
              handleCopy(text, activeTab);
            }}
            className="text-[11px] text-slate-600 hover:text-slate-950 flex items-center gap-1.5 font-medium px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 transition-all bg-white shadow-sm cursor-pointer"
            id={`copy-btn-${activeTab}`}
          >
            {copied === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg overflow-x-auto font-mono text-[11px] leading-relaxed max-h-96 border border-slate-800">
            <code>
              {activeTab === "universal" && universalSnippet}
              {activeTab === "manual" && manualSnippet}
              {activeTab === "curl" && curlSnippet}
            </code>
          </pre>
        </div>

        {activeTab === "universal" && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-600" />
              How Universal Auto-Capture secures 100% of user emails:
            </h4>
            <ul className="text-xs text-slate-500 space-y-1 pl-4 list-decimal leading-relaxed">
              <li>
                <strong>No framework changes required</strong>: It listens to standard browser submit events globally. Whether your target website is built with plain HTML, React, WordPress, Webflow, or Shopify, it intercepts successfully submitted forms automatically.
              </li>
              <li>
                <strong>Smart Input Scanning</strong>: The script intelligently scans the submit event, extracting values from fields with type <code className="bg-slate-200 px-1 rounded text-slate-800 font-mono text-[10px]">email</code> or name containing "email" or "phone".
              </li>
              <li>
                <strong>Zero Delay</strong>: Collected emails are uploaded straight back to your Campaigner contacts in the background seamlessly.
              </li>
            </ul>
          </div>
        )}

        {isDemo && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-slate-900 text-sm block mb-0.5">🔑 Live Integration Required</span>
              These snippets are currently using dummy configuration placeholders. Please connect your Google account to get your personal workspace API Key and active collector endpoint.
            </div>
            {onLogin && (
              <button
                type="button"
                onClick={onLogin}
                className="shrink-0 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-semibold py-1.5 px-3 rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Connect Google</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-slate-600" />
            Security & CORS:
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            <li>
              Send an HTTP <strong>POST</strong> to{" "}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                {appUrl}/api/collect
              </code>
            </li>
            <li>
              Include your access API key{" "}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                x-api-key: {apiKey}
              </code>{" "}
              in the headers (or as{" "}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                apiKey
              </code>{" "}
              parameter in the request JSON payload).
            </li>
            <li>Cross-Origin Resource Sharing (CORS) is fully enabled, ensuring simple browser integrations function securely.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
