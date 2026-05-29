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
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    role: "contributor" | "maintainer";
    created_at: string;
    [key: string]: unknown; 
  };
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
  message: string;
  data: {
    token: string;
    user: User
  };
}
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export interface Reporter {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  reporter: Reporter | null;
}

export interface GetIssuesResponse {
  message: string;
  data: Issue[];
}
export interface IssueDetailsModalProps {
  issueId: number | null; 
  isOpen: boolean;
  onClose: () => void;
}
export interface SingleIssueResponse {
  data: Issue
}
export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export interface ExtendedModalProps extends IssueDetailsModalProps {
  onIssueUpdated?: () => void;
}
export type UpdateIssuePayload = {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
};