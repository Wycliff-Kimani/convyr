const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://convyr-backend.onrender.com/api/v1";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("convyr_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Something went wrong" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (
    full_name: string,
    business_name: string,
    email: string,
    password: string,
  ) =>
    apiRequest<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, business_name, email, password }),
    }),

  me: () => apiRequest<User>("/auth/me"),

  // Business
  getBusiness: () => apiRequest<Business>("/business"),

  connectWhatsApp: (code: string) =>
    apiRequest<Business>("/business/connect-whatsapp", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  disconnectWhatsApp: () =>
    apiRequest<Business>("/business/disconnect-whatsapp", { method: "POST" }),

  deleteAccount: () =>
    apiRequest<{ message: string }>("/account", { method: "DELETE" }),

  // Contacts
  getContacts: () =>
    apiRequest<{ contacts: Contact[]; total: number }>("/contacts"),

  // Messages
  getMessages: () =>
    apiRequest<{ messages: Message[]; total: number }>("/messages"),

  sendMessage: (to: string, text: string) =>
    apiRequest("/messages/send", {
      method: "POST",
      body: JSON.stringify({ to, text }),
    }),

  // Automations
  getAutomations: () =>
    apiRequest<{ automations: Automation[]; total: number }>("/automations"),

  createAutomation: (data: CreateAutomationInput) =>
    apiRequest<Automation>("/automations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAutomation: (id: string, data: Partial<CreateAutomationInput>) =>
    apiRequest<Automation>(`/automations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAutomation: (id: string) =>
    apiRequest(`/automations/${id}`, { method: "DELETE" }),

  // Payments
  initiatePayment: (phone_number: string, plan: string) =>
    apiRequest("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ phone_number, plan }),
    }),

  getPaymentHistory: () =>
    apiRequest<{ payments: Payment[]; total: number }>("/payments/history"),
};

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  business_id: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  whatsapp_phone_number_id: string | null;
  whatsapp_business_account_id: string | null;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
}

export interface Contact {
  id: string;
  phone_number: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  whatsapp_message_id: string;
  contact_id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string;
  status: string;
  created_at: string;
  contacts: {
    name: string | null;
    phone_number: string;
  };
}

export interface Automation {
  id: string;
  business_id: string;
  name: string;
  trigger_type: "any_message" | "contains_keyword";
  keyword: string | null;
  response: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationInput {
  name: string;
  trigger_type: "any_message" | "contains_keyword";
  keyword?: string;
  response: string;
  is_active: boolean;
}

export interface Payment {
  id: string;
  business_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  status: string;
  plan: string;
  created_at: string;
}
