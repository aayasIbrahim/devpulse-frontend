export interface User {
  id: string;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
}
export interface SignupInput {
  id: string;
  name: string;
  email: string;
  password:string;
  role: "contributor" | "maintainer";
}
export interface SignupResponse {
  token: string;
  message?: string;
}
export interface ApiClient {
  // R = unknown দেওয়া হয়েছে যাতে রেসপন্স ডাটা ডিফল্টভাবে টাইপ-সেফ থাকে
  get: <R = unknown>(endpoint: string, options?: RequestInit) => Promise<R>;

  // T = unknown এবং R = unknown ব্যবহার করে রিকোয়েস্ট ও রেসপন্স দুটোই সুরক্ষিত করা হয়েছে
  post: <T = unknown, R = unknown>(
    endpoint: string,
    body: T,
    options?: RequestInit,
  ) => Promise<R>;

  patch: <T = unknown, R = unknown>(
    endpoint: string,
    body: T,
    options?: RequestInit,
  ) => Promise<R>;

  delete: <R = unknown>(endpoint: string, options?: RequestInit) => Promise<R>;
}
export interface LoginInput {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  message?: string;
}
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}
