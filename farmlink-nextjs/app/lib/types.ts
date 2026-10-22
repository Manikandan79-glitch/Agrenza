export type ProduceIcon = "tomato" | "carrot" | "leafy" | "chili";

export type Product = {
  id: number;
  /** Real product ID in the MySQL `products` table. Used for backend API calls. */
  db_id?: number;
  name: string;
  farmer: string;
  location: string;
  price: number;
  category: string;
  icon: ProduceIcon;
  stock: number;
  description: string;
  /** Real product photo. Falls back to the ProduceIcon illustration if missing/broken. */
  image?: string;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  icon: ProduceIcon;
  qty: number;
};

export type Order = {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
  paymentMode: "cod" | "online";
  status: "pending" | "confirmed" | "delivered";
};
