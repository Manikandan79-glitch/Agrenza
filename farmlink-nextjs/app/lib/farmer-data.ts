import { ProduceIcon } from "./types";

export type FarmerProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  icon: ProduceIcon;
};

export type FarmerOrderItem = {
  itemId: number;
  date: string;
  productName: string;
  buyerName: string;
  buyerMobile: string;
  qty: number;
  subtotal: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
};

export const FARMER_NAME = "Ravi Kumar";

export const FARMER_PRODUCTS: FarmerProduct[] = [
  { id: 1, name: "Vine Tomatoes", category: "Vegetables", price: 28, stock: 40, status: "active", icon: "tomato" },
  { id: 5, name: "Country Tomatoes", category: "Vegetables", price: 24, stock: 3, status: "active", icon: "tomato" },
];

export const FARMER_ORDER_ITEMS: FarmerOrderItem[] = [
  { itemId: 101, date: "2026-08-02T10:00:00Z", productName: "Vine Tomatoes", buyerName: "Priya Raman", buyerMobile: "9677988927", qty: 4, subtotal: 112, status: "pending" },
  { itemId: 98, date: "2026-07-29T10:00:00Z", productName: "Country Tomatoes", buyerName: "Arjun Dev", buyerMobile: "9345671234", qty: 2, subtotal: 48, status: "delivered" },
  { itemId: 95, date: "2026-07-25T10:00:00Z", productName: "Vine Tomatoes", buyerName: "Kavya S.", buyerMobile: "9876543210", qty: 6, subtotal: 168, status: "delivered" },
];

export const CATEGORY_OPTIONS = ["Vegetables", "Fruits", "Grains & Cereals", "Pulses", "Spices", "Dairy"];
