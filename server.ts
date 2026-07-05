import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Load configuration
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = null;
if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
  } catch (err) {
    console.error("Failed to read firebase config:", err);
  }
}

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom CORS middleware to allow external integrations to submit contact info
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// A standard API Key for the integration. The admin can use this on their external websites.
const DEFAULT_API_KEY = "marketing_key_default_99";

// API Endpoint to check server status
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API Endpoint to get app configuration (such as public API URL and API Key)
app.get("/api/config", (req, res) => {
  res.json({
    appUrl: process.env.APP_URL || `http://localhost:${PORT}`,
    apiKey: DEFAULT_API_KEY,
    projectId: firebaseConfig?.projectId || ""
  });
});

// API Endpoint to collect contact data (emails & phone numbers) from external websites
app.post("/api/collect", async (req, res) => {
  const { email, phone, source, apiKey } = req.body;
  const requestApiKey = apiKey || req.headers["x-api-key"];

  // Verify API key to prevent unauthorized spam
  if (requestApiKey !== DEFAULT_API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing API key. Please check your integration code snippet."
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Please provide either an email or a phone number to record."
    });
  }

  try {
    if (!firebaseConfig) {
      throw new Error("Firebase configuration not found on server.");
    }

    // Call Firestore REST API to add the contact
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/contacts?key=${firebaseConfig.apiKey}`;
    const body = {
      fields: {
        email: email ? { stringValue: email.trim() } : { nullValue: null },
        phone: phone ? { stringValue: phone.trim() } : { nullValue: null },
        source: { stringValue: (source || "External Website").trim() },
        timestamp: { integerValue: String(Date.now()) },
        status: { stringValue: "active" },
        unsubscribed: { booleanValue: false }
      }
    };

    const firestoreResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!firestoreResponse.ok) {
      const errText = await firestoreResponse.text();
      console.error("Firestore REST API response error:", errText);
      return res.status(500).json({
        error: "Database Error",
        message: "Failed to record contact in the database."
      });
    }

    const data = await firestoreResponse.json();
    return res.json({
      success: true,
      message: "Contact successfully registered!",
      contactId: data.name ? data.name.split("/").pop() : null
    });
  } catch (error: any) {
    console.error("Error in /api/collect:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred."
    });
  }
});

// API Endpoint to send promotional email via Gmail API
app.post("/api/send-campaign", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Google Auth token."
    });
  }

  const accessToken = authHeader.split(" ")[1];
  const { subject, content, recipients } = req.body;

  if (!subject || !content || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Subject, content, and an array of recipients are required."
    });
  }

  const results = {
    total: recipients.length,
    success: 0,
    failed: 0,
    details: [] as Array<{ email: string; success: boolean; messageId?: string; error?: string }>
  };

  // Process all emails
  for (const recipient of recipients) {
    try {
      // Build MIME email (RFC 822 format)
      // Note: We encode the email contents as utf-8, use HTML content-type, and base64url-encode it
      const emailLines = [
        `To: ${recipient}`,
        `Subject: ${subject}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        "",
        content
      ];
      const mimeEmail = emailLines.join("\r\n");
      const encodedEmail = Buffer.from(mimeEmail, "utf-8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const gmailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!gmailResponse.ok) {
        const errText = await gmailResponse.text();
        throw new Error(errText || "Failed to send email");
      }

      const resData: any = await gmailResponse.json();
      results.success++;
      results.details.push({
        email: recipient,
        success: true,
        messageId: resData.id
      });
    } catch (err: any) {
      console.error(`Failed to send email to ${recipient}:`, err);
      results.failed++;
      results.details.push({
        email: recipient,
        success: false,
        error: err.message || "Unknown error"
      });
    }
  }

  // Create campaign log in Firestore if firebaseConfig is available
  if (firebaseConfig) {
    try {
      const logUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/campaigns?key={apiKey}`;
      const logUrlFormatted = logUrl.replace("{apiKey}", firebaseConfig.apiKey);
      const logBody = {
        fields: {
          subject: { stringValue: subject },
          content: { stringValue: content },
          sentAt: { stringValue: new Date().toISOString() },
          recipientsCount: { integerValue: String(recipients.length) },
          successCount: { integerValue: String(results.success) },
          failedCount: { integerValue: String(results.failed) },
          status: { stringValue: results.failed === 0 ? "sent" : "completed_with_errors" }
        }
      };

      await fetch(logUrlFormatted, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logBody)
      });
    } catch (logErr) {
      console.error("Failed to log campaign to Firestore:", logErr);
    }
  }

  return res.json(results);
});

// Vite middleware & Static asset serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
