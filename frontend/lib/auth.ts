import { api, User } from "./api";

const TOKEN_KEY = "convyr_token";
const USER_KEY = "convyr_user";

export const auth = {
  saveSession: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await api.login(email, password);
    auth.saveSession(response.access_token, response.user);
    return response.user;
  },

  register: async (
    full_name: string,
    business_name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const response = await api.register(
      full_name,
      business_name,
      email,
      password,
    );
    auth.saveSession(response.access_token, response.user);
    return response.user;
  },

  logout: () => {
    auth.clearSession();
    window.location.href = "/login";
  },
};
