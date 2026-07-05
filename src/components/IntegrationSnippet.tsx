import React, { useState } from "react";
import { Code2, Check, Copy, Terminal, Smartphone, Mail } from "lucide-react";
import { ConfigInfo } from "../types";

interface IntegrationSnippetProps {
  config: ConfigInfo | null;
}

export default function IntegrationSnippet({ config }: IntegrationSnippetProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"email" | "phone" | "curl">("email");

  const appUrl = config?.appUrl || "https://your-marketing-app.run.app";
  const apiKey = config?.apiKey || "marketing_key_default_99";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const emailSnippet = `<!-- Add this script block to your website's login or registration flow -->
<script>
  function registerSubscriberEmail(userEmail) {
    fetch('${appUrl}/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}'
      },
      body: JSON.stringify({
        email: userEmail,
        source: window.location.hostname || 'My Main Website'
      })
    })
    .then(response => response.json())
    .then(data => console.log('Subscriber registered:', data))
    .catch(error => console.error('Registration failed:', error));
  }

  // Example hook: Call this whenever a user logs in successfully
  // registerSubscriberEmail('user@example.com');
</script>`;

  const phoneSnippet = `<!-- Add this script block to collect mobile phone numbers -->
<script>
  function registerSubscriberPhone(mobileNumber) {
    fetch('${appUrl}/api/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}'
      },
      body: JSON.stringify({
        phone: mobileNumber,
        source: window.location.hostname || 'My Mobile App'
      })
    })
    .then(response => response.json())
    .then(data => console.log('Mobile number registered:', data))
    .catch(error => console.error('Registration failed:', error));
  }

  // Example hook: Call this when user inputs their mobile number
  // registerSubscriberPhone('+15550199');
</script>`;

  const curlSnippet = `# Record an email address
curl -X POST "${appUrl}/api/collect" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{"email": "customer@gmail.com", "source": "Landing Page"}'

# Record a mobile number
curl -X POST "${appUrl}/api/collect" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{"phone": "+1234567890", "source": "Checkout Form"}'`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-slate-700" />
          Collect Data from Your Other Websites
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Embed these lightweight scripts into your main websites or mobile apps to automatically record subscriber emails and phone numbers.
        </p>
      </div>

      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab("email")}
          className={`flex-1 py-3 px-4 text-center border-b-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === "email"
              ? "border-slate-900 text-slate-900 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
          id="tab-email-integration"
        >
          <Mail className="h-4 w-4" />
          Email Sync
        </button>
        <button
          onClick={() => setActiveTab("phone")}
          className={`flex-1 py-3 px-4 text-center border-b-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === "phone"
              ? "border-slate-900 text-slate-900 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
          id="tab-phone-integration"
        >
          <Smartphone className="h-4 w-4" />
          Mobile Number Sync
        </button>
        <button
          onClick={() => setActiveTab("curl")}
          className={`flex-1 py-3 px-4 text-center border-b-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === "curl"
              ? "border-slate-900 text-slate-900 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
          }`}
          id="tab-curl-integration"
        >
          <Terminal className="h-4 w-4" />
          REST / cURL API
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            {activeTab === "email" && "JavaScript Email Collection Script"}
            {activeTab === "phone" && "JavaScript Phone Number Collection Script"}
            {activeTab === "curl" && "Direct REST API Examples"}
          </span>
          <button
            onClick={() => {
              const text = activeTab === "email" ? emailSnippet : activeTab === "phone" ? phoneSnippet : curlSnippet;
              handleCopy(text, activeTab);
            }}
            className="text-xs text-slate-500 hover:text-slate-950 flex items-center gap-1.5 font-medium px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 transition-all"
            id={`copy-btn-${activeTab}`}
          >
            {copied === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed max-h-96">
            <code>
              {activeTab === "email" && emailSnippet}
              {activeTab === "phone" && phoneSnippet}
              {activeTab === "curl" && curlSnippet}
            </code>
          </pre>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-medium text-slate-800 mb-1">Integration Setup Info:</h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            <li>
              Send a HTTP <strong>POST</strong> to{" "}
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
            <li>Cross-Origin Resource Sharing (CORS) is enabled so it works seamlessly on any browser site.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
