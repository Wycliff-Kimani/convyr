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

  updateBusinessSettings: (data: UpdateBusinessSettingsInput) =>
    apiRequest<Business>("/business/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

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

  updateContact: (contact_id: string, data: UpdateContactInput) =>
    apiRequest<Contact>(`/contacts/${contact_id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Messages
  getMessages: () =>
    apiRequest<{ messages: Message[]; total: number }>("/messages"),

  sendMessage: (to: string, text: string) =>
    apiRequest("/messages/send", {
      method: "POST",
      body: JSON.stringify({ to, text }),
    }),

  deleteMessage: (message_id: string, delete_for_everyone: boolean = false) =>
    apiRequest(
      `/messages/${message_id}?delete_for_everyone=${delete_for_everyone}`,
      {
        method: "DELETE",
      },
    ),

  markAsReplied: (message_id: string) =>
    apiRequest(`/messages/${message_id}/mark-replied`, {
      method: "POST",
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

  // AI
  suggestReply: (messages: { direction: string; content: string }[]) =>
    apiRequest<{ suggestion: string }>("/suggest-reply", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),

  // Payments
  initiatePayment: (phone_number: string, plan: string) =>
    apiRequest("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ phone_number, plan }),
    }),

  getPaymentHistory: () =>
    apiRequest<{ payments: Payment[]; total: number }>("/payments/history"),

  // Products
  getProducts: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category) query.append("category", params.category);
    const qs = query.toString();
    return apiRequest<{ products: Product[]; total: number }>(
      `/products${qs ? `?${qs}` : ""}`,
    );
  },

  createProduct: (data: ProductInput) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<ProductInput>) =>
    apiRequest<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),

  uploadProductsCSV: async (file: File) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("convyr_token")
        : null;
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/products/upload-csv`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || "Upload failed");
    }
    return response.json() as Promise<{
      message: string;
      imported: number;
      skipped: number;
    }>;
  },

  getProductCategories: () =>
    apiRequest<{ categories: string[] }>("/products/categories"),
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
  fallback_cooldown_minutes: number;
  created_at: string;
}

export interface UpdateBusinessSettingsInput {
  fallback_cooldown_minutes: number;
}

export interface Contact {
  id: string;
  phone_number: string;
  name: string | null;
  label: string;
  notes: string | null;
  is_repeat: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateContactInput {
  label?: string;
  notes?: string;
  name?: string;
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
  deleted_for_me: boolean;
  deleted_for_everyone: boolean;
  replied_by_admin?: boolean;
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
  cooldown_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationInput {
  name: string;
  trigger_type: "any_message" | "contains_keyword";
  keyword?: string;
  response: string;
  is_active: boolean;
  cooldown_minutes: number;
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

export interface Product {
  id: string;
  business_id: string;
  sku: string | null;
  name: string;
  price: number | null;
  stock: number;
  description: string | null;
  category: string | null;
  images: string[];
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  sku?: string;
  name: string;
  price?: number;
  stock?: number;
  description?: string;
  category?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}