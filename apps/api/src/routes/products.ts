import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  GetProductParams,
  GetProductResponse,
  ListProductsQueryParams,
  GetFeaturedProductsResponseItem,
  GetNewArrivalsResponseItem,
  GetStoreStatsResponse,
} from "../schemas";

const router: IRouter = Router();

function buildProductResponse(p: any, catName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice != null ? parseFloat(p.originalPrice) : null,
    imageUrl: p.imageUrl ?? null,
    images: p.images ?? [],
    categoryId: p.categoryId,
    categoryName: catName ?? null,
    stock: p.stock,
    isFeatured: p.isFeatured,
    rating: p.rating != null ? parseFloat(p.rating) : null,
    reviewCount: p.reviewCount,
    createdAt:
      p.createdAt instanceof Date
        ? p.createdAt.toISOString()
        : String(p.createdAt),
  };
}

router.get("/products/featured", async (req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isFeatured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(10);

  const cats = await db.select().from(categoriesTable);
  const catMap: Record<number, string> = {};
  cats.forEach((c) => (catMap[c.id] = c.name));

  res.json(
    products.map((p) =>
      GetFeaturedProductsResponseItem.parse(
        buildProductResponse(p, catMap[p.categoryId]),
      ),
    ),
  );
});

router.get("/products/new-arrivals", async (req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap: Record<number, string> = {};
  cats.forEach((c) => (catMap[c.id] = c.name));

  res.json(
    products.map((p) =>
      GetNewArrivalsResponseItem.parse(
        buildProductResponse(p, catMap[p.categoryId]),
      ),
    ),
  );
});

router.get("/store/stats", async (req, res): Promise<void> => {
  const [totalProds] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable);
  const [totalCats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categoriesTable);
  const [featured] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(eq(productsTable.isFeatured, true));

  res.json(
    GetStoreStatsResponse.parse({
      totalProducts: Number(totalProds?.count ?? 0),
      totalCategories: Number(totalCats?.count ?? 0),
      featuredCount: Number(featured?.count ?? 0),
      newArrivalsCount: 8,
    }),
  );
});

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { categoryId, search, featured, limit = 20, offset = 0 } = query.data;

  const conditions = [];
  if (categoryId != null)
    conditions.push(eq(productsTable.categoryId, categoryId));
  if (search) {
    conditions.push(
      sql`lower(${productsTable.name}) like ${`%${search.toLowerCase()}%`}`,
    );
  }
  if (featured != null) conditions.push(eq(productsTable.isFeatured, featured));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, [{ total }]] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(whereClause)
      .orderBy(desc(productsTable.createdAt))
      .limit(limit ?? 20)
      .offset(offset ?? 0),
    db
      .select({ total: sql<number>`count(*)` })
      .from(productsTable)
      .where(whereClause),
  ]);

  const cats = await db.select().from(categoriesTable);
  const catMap: Record<number, string> = {};
  cats.forEach((c) => (catMap[c.id] = c.name));

  res.json({
    products: products.map((p) =>
      buildProductResponse(p, catMap[p.categoryId]),
    ),
    total: Number(total ?? 0),
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [cat] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, product.categoryId));

  res.json(GetProductResponse.parse(buildProductResponse(product, cat?.name)));
});

export default router;
