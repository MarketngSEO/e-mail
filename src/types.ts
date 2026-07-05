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

export interface ConfigInfo {
  appUrl: string;
  apiKey: string;
  projectId: string;
}
