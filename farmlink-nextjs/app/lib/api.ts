const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/farmlink/farmlink/backend/api";

export class ApiError extends Error {}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (res.status === 401) throw new ApiError("Session expired. Please log in again.");
    if (res.status === 403) throw new ApiError("Access denied. Please check your account permissions.");
    throw new ApiError(`Server error (${res.status}): ${text.substring(0, 100) || "Unexpected response"}`);
  }

  if (!res.ok || !data.ok) {
    throw new ApiError(data.error || "Something went wrong.");
  }
  return data as T;
}

async function request<T = any>(path: string, body?: object): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

async function getRequest<T = any>(path: string, params?: Record<string, string>): Promise<T> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_URL}${path}${qs}`, {
    method: "GET",
    credentials: "include",
  });
  return parseResponse<T>(res);
}

async function requestFormData<T = any>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return parseResponse<T>(res);
}

export type Role = "buyer" | "farmer";

export type RegisterResponse = {
  registered_pending: boolean;
  email: string;
  mobile: string;
  role: Role;
  auto_password_sent: boolean;
  auto_password?: string;
  dev_otp?: string;
  dev_token?: string;
  message: string;
};

/** Stages unverified registration in pending_registrations and dispatches verification email. */
export function registerUser(body: {
  role: Role;
  name: string;
  mobile: string;
  password?: string;
  email: string;
  aadhaar?: string;
}) {
  return request<RegisterResponse>("/auth/register.php", body);
}

/** Sends the Firebase-verified mobile ID token to the backend, which checks it and marks is_verified = 1. */
export function verifyMobileWithBackend(idToken: string, mobile: string) {
  return request<{ verified: boolean; requires_approval: boolean }>("/auth/verify-otp.php", {
    idToken,
    mobile,
  });
}

/**
 * Verifies email via FarmLink token, 6-digit OTP code, or Firebase ID token.
 * Upon verification, account is transferred into the users database table.
 */
export function verifyEmailWithBackend(params: {
  email: string;
  token?: string;
  otp?: string;
  idToken?: string;
}) {
  return request<{
    email_verified: boolean;
    verified: boolean;
    requires_approval: boolean;
    role?: string;
    user?: { id: number; name: string; role: string };
    message?: string;
  }>("/auth/verify-email.php", params);
}

export type EmailAuthenticityResult = {
  ok: boolean;
  status: "original" | "disposable" | "duplicate" | "invalid_domain" | "invalid_format" | "invalid_gmail" | "empty";
  is_original: boolean;
  is_duplicate: boolean;
  provider: string | null;
  error: string | null;
  message: string;
};

/** Checks whether an email is authentic/original Gmail vs fake/disposable/duplicate. */
export async function checkEmailAuthenticity(email: string, role?: string): Promise<EmailAuthenticityResult> {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      ok: false,
      status: "empty",
      is_original: false,
      is_duplicate: false,
      provider: null,
      error: null,
      message: "",
    };
  }

  try {
    const res = await fetch(`${API_URL}/auth/check-email.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, role: role || undefined }),
    });
    const data = await res.json().catch(() => null);
    if (data && typeof data.status === "string") {
      return data as EmailAuthenticityResult;
    }
    return {
      ok: false,
      status: "invalid_format",
      is_original: false,
      is_duplicate: false,
      provider: null,
      error: data?.error || "Could not verify email.",
      message: data?.error || "Could not verify email.",
    };
  } catch {
    return {
      ok: false,
      status: "invalid_format",
      is_original: false,
      is_duplicate: false,
      provider: null,
      error: "Network error checking email.",
      message: "Network error checking email.",
    };
  }
}

export function loginUser(body: { role: string; email: string; password: string }) {
  return request<{ user: { id: number; name: string; role: string } }>("/auth/login.php", body);
}

export type AuthUser = {
  id: number;
  name: string;
  email?: string | null;
  mobile?: string | null;
  role: string;
  created_at?: string | null;
};

export function getMe() {
  return getRequest<{ user: AuthUser | null }>("/auth/me.php");
}

export function logoutUser() {
  return request<{ ok: boolean }>("/auth/logout.php");
}

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------

export type FarmerStatus = "pending" | "approved" | "rejected" | "all";
export type AdminFarmer = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  aadhaar: string | null;
  status: "pending" | "approved" | "rejected";
  remark: string | null;
  joined: string;
  total_products?: number;
  total_sales?: number;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  category_id?: number;
  price: number;
  base_price?: number;
  gst_percent?: number;
  gst_amount?: number;
  commission_percent?: number;
  commission_amount?: number;
  stock: number;
  image: string | null;
  description: string;
  status: "active" | "inactive";
  approval_status?: "pending" | "approved" | "rejected";
  admin_remark?: string | null;
  farmer?: string;
  farmer_mobile?: string;
};

export function listCategories() {
  return getRequest<{ categories: { id: number; name: string }[] }>("/products/categories.php");
}

export function listProducts(params?: Record<string, string>) {
  return getRequest<{ products: Product[] }>("/products/list.php", params);
}

export function getProductDetail(id: number | string) {
  return getRequest<{ product: Product }>("/products/detail.php", { id: String(id) });
}

export function createProduct(formData: FormData) {
  return requestFormData<{ product_id: number }>("/products/create.php", formData);
}

export function updateProduct(formData: FormData) {
  return requestFormData<{ updated: boolean }>("/products/update.php", formData);
}

export function deleteProduct(id: number) {
  return request<{ deleted: boolean }>("/products/delete.php", { id });
}

export function refillProduct(id: number, refill_kg: number, action: "add" | "set" = "add") {
  return request<{
    refilled: boolean;
    product_id: number;
    product_name: string;
    old_stock: number;
    refill_amount: number;
    new_stock: number;
    status: string;
    message: string;
  }>("/products/refill.php", { id, refill_kg, action });
}

export type AdminProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  base_price?: number;
  gst_percent?: number;
  gst_amount?: number;
  commission_percent?: number;
  commission_amount?: number;
  stock: number;
  image: string | null;
  description: string;
  status: "active" | "inactive";
  approval_status: "pending" | "approved" | "rejected";
  remark: string | null;
  farmer_id: number;
  farmer_name: string;
  farmer_email: string | null;
  farmer_mobile: string;
  created_at: string;
};

export type AdminBulkRequest = {
  id: number;
  product_name: string;
  qty: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  remark: string | null;
  buyer_name: string;
  buyer_email: string | null;
  buyer_mobile: string;
  created_at: string;
};

export type AdminOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  qty: number;
  price_per_kg: number;
  subtotal: number;
  current_stock: number;
  status: string;
  farmer_name: string;
  farmer_mobile: string;
};

export type AdminOrder = {
  id: number;
  buyer_id: number;
  buyer_name: string;
  buyer_mobile: string;
  buyer_email: string | null;
  total_amount: number;
  payment_mode: "cod" | "online";
  address: string;
  status: string;
  tracking_note?: string;
  created_at: string;
  item_count: number;
  items?: AdminOrderItem[];
};

export type FarmerOrderItem = {
  item_id: number;
  order_id: number;
  order_date: string;
  product_id: number;
  product_name: string;
  product_image: string | null;
  current_stock: number;
  buyer_name: string;
  buyer_mobile: string;
  address: string;
  payment_mode: string;
  qty: number;
  price_per_kg: number;
  subtotal: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
};

export function listFarmerOrderItems() {
  return getRequest<{ items: FarmerOrderItem[] }>("/orders/farmer-items.php");
}

export function updateFarmerOrderItemStatus(item_id: number, status: string) {
  return request<{ updated: boolean }>("/orders/update-item-status.php", { item_id, status });
}

export type SharedEmailAccount = {
  email: string;
  mobile?: string;
  shared_by?: "email" | "mobile" | "both";
  farmer: {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    status: "pending" | "approved" | "rejected";
    aadhaar: string | null;
    remark: string | null;
    joined: string;
    total_products: number;
    total_sales: number;
  };
  buyer: {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    status: string;
    joined: string;
    total_orders: number;
    total_spent: number;
  };
};

export function adminSharedEmails() {
  return getRequest<{
    total_shared: number;
    shared_accounts: SharedEmailAccount[];
  }>("/admin/shared-emails.php");
}

export function adminStats(from?: string, to?: string) {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to)   params.to   = to;
  return getRequest<{
    pending_farmers: number;
    pending_products: number;
    pending_bulk: number;
    total_farmers: number;
    total_buyers: number;
    shared_gmail_count?: number;
    total_products: number;
    approved_products: number;
    total_income: number;
    platform_earnings: number;
    today_income: number;
    total_orders: number;
    completed_orders: number;
    filter_from?: string | null;
    filter_to?: string | null;
  }>("/admin/stats.php", Object.keys(params).length ? params : undefined);
}


export function adminListFarmers(status: FarmerStatus = "pending") {
  return getRequest<{ farmers: AdminFarmer[] }>("/admin/farmers.php", { status });
}

export function adminFarmerAction(id: number, action: "approve" | "reject", remark?: string) {
  return request<{ updated: boolean; status: string }>("/admin/farmer-action.php", { id, action, remark });
}

export function adminListProducts(status: FarmerStatus = "pending") {
  return getRequest<{ products: AdminProduct[] }>("/admin/products.php", { status });
}

export function adminProductAction(id: number, action: "approve" | "reject", remark?: string) {
  return request<{ updated: boolean; approval_status: string }>("/admin/product-action.php", { id, action, remark });
}

export function adminListBulkRequests(status: FarmerStatus = "pending") {
  return getRequest<{ requests: AdminBulkRequest[] }>("/admin/bulk-requests.php", { status });
}

export function adminBulkRequestAction(id: number, action: "approve" | "reject", remark?: string) {
  return request<{ updated: boolean; status: string }>("/admin/bulk-request-action.php", { id, action, remark });
}

export function submitBulkRequest(product_id: number, qty: number, reason: string) {
  return request<{ request_id: number }>("/bulk-requests/create.php", { product_id, qty, reason });
}

export type BuyerBulkRequest = {
  id: number;
  product_name: string;
  qty: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  remark?: string | null;
  date: string;
};

export function listMyBulkRequests() {
  return getRequest<{ requests: BuyerBulkRequest[] }>("/bulk-requests/mine.php");
}

export type BuyerOrderItem = {
  product_id: number;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  status: string;
};

export type BuyerOrder = {
  id: number;
  date: string;
  total: number;
  payment_mode: string;
  status: "pending" | "confirmed" | "packing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  tracking_note?: string;
  address: string;
  items: BuyerOrderItem[];
};

export function listMyOrders() {
  return getRequest<{ orders: BuyerOrder[] }>("/orders/mine.php");
}

export function adminListOrders() {
  return getRequest<{ orders: AdminOrder[]; total_revenue: number }>("/admin/orders.php");
}

export function adminUpdateOrderStatus(order_id: number, status: string, tracking_note?: string) {
  return request<{ updated: boolean; order_id: number; status: string; message: string }>(
    "/admin/update-order-status.php",
    { order_id, status, tracking_note }
  );
}

export function placeOrderApi(body: {
  address: string;
  payment_mode: "cod" | "online";
  items: { product_id: number; qty: number }[];
}) {
  return request<{ order_id: number; total: number }>("/orders/place.php", body);
}

export interface EarningItem {
  date: string;
  product_name: string;
  qty: number;
  amount: number;
  status: string;
}

export function farmerEarnings(from?: string, to?: string) {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to)   params.to   = to;
  return getRequest<{
    total_earned: number;
    pending_amount: number;
    today_earned: number;
    order_count: number;
    history: EarningItem[];
    filter_from: string | null;
    filter_to: string | null;
  }>("/farmer/earnings.php", Object.keys(params).length ? params : undefined);
}

export function farmerDashboardStats() {
  return getRequest<{
    product_count: number;
    total_earnings: number;
    pending_orders: number;
    low_stock: { name: string; stock: number }[];
  }>("/farmer/dashboard-stats.php");
}
