import { Product } from "./types";

/**
 * Placeholder catalog so every page renders standalone. Once the PHP
 * backend exposes a JSON endpoint (e.g. backend/api/products.php),
 * replace this with a fetch() call — see README.md.
 *
 * `image` uses Wikimedia Commons' stable Special:FilePath redirect
 * (https://commons.wikimedia.org/wiki/Special:FilePath/<file name>),
 * which always resolves to the current full-size upload for that file —
 * no CDN hash to keep track of, and every file below is real, freely
 * licensed (CC / public domain) produce photography. Swap these for your
 * farmers' own uploaded photos once `products/create.php` is wired up
 * (see "Product images" in README.md).
 *
 * db_id: the real product ID in the MySQL `products` table.
 * Used when calling backend APIs (bulk requests, orders, etc.)
 */
const WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath/";

export const PRODUCTS: Product[] = [
  { id: 1,  db_id: 11, name: "Vine Tomatoes",   farmer: "Ravi Kumar",    location: "Salem",      price: 28, category: "Vegetables",   icon: "tomato", stock: 40, description: "Sun-ripened tomatoes picked this morning, ideal for curries and chutneys. No cold storage — sold within a day of harvest.", image: `${WIKI}Tomato_je.jpg` },
  { id: 2,  db_id: 13, name: "Local Carrots",    farmer: "Meena Devi",   location: "Ooty",       price: 32, category: "Vegetables",   icon: "carrot", stock: 25, description: "Sweet, crisp hill-grown carrots. Great raw, roasted, or in a home-style sambar.", image: `${WIKI}Carrots.JPG` },
  { id: 3,  db_id: 12, name: "Fresh Spinach",    farmer: "Suresh P.",    location: "Erode",      price: 18, category: "Leafy Greens", icon: "leafy",  stock: 15, description: "Tender spinach leaves, harvested at dawn. Rich in iron, best used within two days.", image: `${WIKI}Spinach_leaves.jpg` },
  { id: 4,  db_id: 14, name: "Green Chili",      farmer: "Lakshmi N.",   location: "Coimbatore", price: 45, category: "Vegetables",   icon: "chili",  stock: 12, description: "Medium-heat green chilies, hand-picked and sorted for freshness.", image: `${WIKI}Aesthetic_green_Chillies.JPG` },
  { id: 5,  db_id: 11, name: "Country Tomatoes", farmer: "Muthu Selvam", location: "Dindigul",   price: 24, category: "Vegetables",   icon: "tomato", stock: 60, description: "Slightly tangier native variety, well suited for rasam and pickles.", image: `${WIKI}Tomatoes_ARS.jpg` },
  { id: 6,  db_id: 13, name: "Baby Carrots",     farmer: "Meena Devi",   location: "Ooty",       price: 38, category: "Vegetables",   icon: "carrot", stock: 18, description: "Small, tender carrots — a favourite for salads and steaming whole.", image: `${WIKI}Carrots_with_stems.jpg` },
  { id: 7,  db_id: 12, name: "Amaranth Greens",  farmer: "Suresh P.",    location: "Erode",      price: 16, category: "Leafy Greens", icon: "leafy",  stock: 20, description: "Local mulaikeerai, a staple in South Indian home cooking.", image: `${WIKI}Basella_alba_leaves_27052014.jpg` },
  { id: 8,  db_id: 14, name: "Byadgi Chili",     farmer: "Lakshmi N.",   location: "Coimbatore", price: 52, category: "Vegetables",   icon: "chili",  stock:  8, description: "Mild, deep-red chilies prized for colour more than heat.", image: `${WIKI}Chili_pepper.jpg` },
];

export const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

export function getProduct(id: number): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
