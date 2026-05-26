import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  GetCategoryParams,
  GetCategoryResponse,
  ListCategoriesResponseItem,
} from "../schemas";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const cats = await db
    .select()
    .from(categoriesTable)
    .orderBy(categoriesTable.name);

  const productCounts = await db
    .select({
      categoryId: productsTable.categoryId,
      count: sql<number>`count(*)`,
    })
    .from(productsTable)
    .groupBy(productsTable.categoryId);

  const countMap: Record<number, number> = {};
  productCounts.forEach((r) => {
    countMap[r.categoryId] = Number(r.count ?? 0);
  });

  const result = cats.map((c) =>
    ListCategoriesResponseItem.parse({
      ...c,
      productCount: countMap[c.id] ?? 0,
    }),
  );

  res.json(result);
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCategoryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cat] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, params.data.id));

  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(eq(productsTable.categoryId, cat.id));

  res.json(
    GetCategoryResponse.parse({ ...cat, productCount: Number(count ?? 0) }),
  );
});

export default router;
