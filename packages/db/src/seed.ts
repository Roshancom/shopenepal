import "dotenv/config";
import { sql } from "drizzle-orm";
import { categoriesTable, productsTable } from "./schema";

import { db, pool } from ".";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in your .env file");
}

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Smartphones, laptops, gadgets and more",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, shoes and accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, decor and kitchen items",
    imageUrl:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80",
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Gym equipment, outdoor gear and sportswear",
    imageUrl:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80",
  },
  {
    name: "Books & Stationery",
    slug: "books-stationery",
    description: "Books, pens, notebooks and office supplies",
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80",
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    description: "Skincare, cosmetics and personal care",
    imageUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  },
];

const products = [
  {
    categorySlug: "electronics",
    name: "Samsung Galaxy A54 5G",
    slug: "samsung-galaxy-a54-5g",
    description:
      "High performance 5G smartphone with 50MP camera and 5000mAh battery. Perfect for everyday use.",
    price: "38999",
    originalPrice: "45000",
    imageUrl:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    ],
    stock: 15,
    isFeatured: true,
    rating: "4.5",
    reviewCount: 128,
  },
  {
    categorySlug: "electronics",
    name: "Noise ColorFit Pro 4 Smartwatch",
    slug: "noise-colorfit-pro-4",
    description:
      "Advanced smartwatch with AMOLED display, health monitoring and Bluetooth calling.",
    price: "6999",
    originalPrice: "9999",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    ],
    stock: 30,
    isFeatured: true,
    rating: "4.2",
    reviewCount: 89,
  },
  {
    categorySlug: "electronics",
    name: "BoAt Airdopes 141 Earbuds",
    slug: "boat-airdopes-141",
    description:
      "True wireless earbuds with 42 hours total playback, IPX4 rating and instant voice assistant.",
    price: "1499",
    originalPrice: "2999",
    imageUrl:
      "https://images.unsplash.com/photo-1590658165737-15a047b7c0a2?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658165737-15a047b7c0a2?w=400&q=80",
    ],
    stock: 50,
    isFeatured: false,
    rating: "4.1",
    reviewCount: 245,
  },
  {
    categorySlug: "electronics",
    name: "Lenovo IdeaPad Slim 3",
    slug: "lenovo-ideapad-slim-3",
    description:
      "Lightweight laptop with AMD Ryzen 5, 8GB RAM, 512GB SSD. Ideal for students and professionals.",
    price: "52999",
    originalPrice: "62000",
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    ],
    stock: 8,
    isFeatured: true,
    rating: "4.3",
    reviewCount: 67,
  },
  {
    categorySlug: "fashion",
    name: "Men Cotton Kurta Set",
    slug: "men-cotton-kurta-set",
    description:
      "Premium cotton kurta with matching pajama. Traditional design with modern fit. Available in multiple colors.",
    price: "1299",
    originalPrice: "1800",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4f07?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4f07?w=400&q=80",
    ],
    stock: 40,
    isFeatured: false,
    rating: "4.0",
    reviewCount: 56,
  },
  {
    categorySlug: "fashion",
    name: "Women Floral Dress",
    slug: "women-floral-dress",
    description:
      "Beautiful floral print dress made from breathable fabric. Perfect for casual and semi-formal occasions.",
    price: "1599",
    originalPrice: "2200",
    imageUrl:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
    ],
    stock: 25,
    isFeatured: true,
    rating: "4.4",
    reviewCount: 92,
  },
  {
    categorySlug: "fashion",
    name: "Nike Air Max Running Shoes",
    slug: "nike-air-max-shoes",
    description:
      "Premium running shoes with Air Max cushioning. Breathable mesh upper, durable rubber outsole.",
    price: "8500",
    originalPrice: "11000",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    ],
    stock: 20,
    isFeatured: true,
    rating: "4.6",
    reviewCount: 178,
  },
  {
    categorySlug: "home-living",
    name: "Prestige Non-Stick Cookware Set",
    slug: "prestige-nonstick-cookware",
    description:
      "Complete 5-piece non-stick cookware set including kadai, tawa, and saucepan. Induction compatible.",
    price: "3499",
    originalPrice: "5000",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    ],
    stock: 18,
    isFeatured: false,
    rating: "4.3",
    reviewCount: 134,
  },
  {
    categorySlug: "home-living",
    name: "Wooden Study Table",
    slug: "wooden-study-table",
    description:
      "Solid wood study table with drawer and shelf. Ergonomic design ideal for students and home offices.",
    price: "7999",
    originalPrice: "11000",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    ],
    stock: 10,
    isFeatured: true,
    rating: "4.2",
    reviewCount: 45,
  },
  {
    categorySlug: "sports-fitness",
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description:
      "Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Perfect for all yoga styles.",
    price: "1299",
    originalPrice: "1800",
    imageUrl:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80",
    ],
    stock: 35,
    isFeatured: false,
    rating: "4.5",
    reviewCount: 213,
  },
  {
    categorySlug: "sports-fitness",
    name: "Dumbbell Set 10kg",
    slug: "dumbbell-set-10kg",
    description:
      "Cast iron dumbbell set with rubber coating. Anti-roll design, comfortable grip. Great for home workouts.",
    price: "2999",
    originalPrice: "3800",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    ],
    stock: 22,
    isFeatured: false,
    rating: "4.4",
    reviewCount: 88,
  },
  {
    categorySlug: "books-stationery",
    name: "The Alchemist - Paulo Coelho",
    slug: "the-alchemist-book",
    description:
      "International bestseller about following your dreams. An inspiring journey of self-discovery.",
    price: "399",
    originalPrice: "550",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    ],
    stock: 60,
    isFeatured: true,
    rating: "4.8",
    reviewCount: 892,
  },
  {
    categorySlug: "books-stationery",
    name: "Pilot G2 Pen Set (12 pcs)",
    slug: "pilot-g2-pen-set",
    description:
      "Premium gel ink pens for smooth writing. Fine point 0.7mm. Multiple colors included.",
    price: "699",
    originalPrice: "950",
    imageUrl:
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80",
    ],
    stock: 80,
    isFeatured: false,
    rating: "4.3",
    reviewCount: 156,
  },
  {
    categorySlug: "beauty-health",
    name: "Himalaya Face Wash Kit",
    slug: "himalaya-face-wash-kit",
    description:
      "Complete skincare kit with neem face wash, moisturizer, and purifying scrub. Natural ingredients.",
    price: "899",
    originalPrice: "1200",
    imageUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    ],
    stock: 45,
    isFeatured: true,
    rating: "4.2",
    reviewCount: 324,
  },
  {
    categorySlug: "beauty-health",
    name: "Mamaearth Vitamin C Serum",
    slug: "mamaearth-vitamin-c-serum",
    description:
      "Brightening vitamin C face serum with hyaluronic acid. Reduces dark spots and gives glowing skin.",
    price: "699",
    originalPrice: "999",
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    ],
    stock: 38,
    isFeatured: false,
    rating: "4.4",
    reviewCount: 267,
  },
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Insert categories
  console.log("📂 Inserting categories...");
  await db
    .insert(categoriesTable)
    .values(categories)
    .onDuplicateKeyUpdate({
      set: {
        slug: sql`slug`,
      },
    });

  // Fetch all categories to get IDs and counts
  const allCats = await db.select().from(categoriesTable);
  console.log(`   ✅ ${allCats.length} categories in database\n`);
  const catMap: Record<string, number> = {};
  allCats.forEach((c) => (catMap[c.slug] = c.id));

  // Insert products
  console.log("📦 Inserting products...");
  const productValues = products.map(({ categorySlug, ...rest }) => ({
    ...rest,
    categoryId: catMap[categorySlug],
  }));

  await db
    .insert(productsTable)
    .values(productValues)
    .onDuplicateKeyUpdate({
      set: {
        slug: sql`slug`,
      },
    });

  const [{ count: productCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable);
  console.log(`   ✅ ${productCount ?? 0} products in database\n`);

  console.log("✨ Seed complete! Your database is ready.");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
