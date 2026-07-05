export interface Contact {
  id: string;
  email: string | null;
  phone: string | null;
  source: string;
  timestamp: number;
  status: "active" | "unsubscribed";
  unsubscribed: boolean;
}

export interface Campaign {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  recipientsCount: number;
  successCount: number;
  failedCount: number;
  status: string;
}

export interface ConnectedWebsite {
  id: string;
  url: string;
  name: string;
  addedAt: number;
  status: "connected" | "syncing" | "error";
  lastSyncAt?: number;
}

export interface ConfigInfo {
  appUrl: string;
  apiKey: string;
  projectId: string;
}
