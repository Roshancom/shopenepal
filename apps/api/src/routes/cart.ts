import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetCartParams,
  ClearCartParams,
  AddCartItemParams,
  AddCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
} from "../schemas";

const router: IRouter = Router();

const DELIVERY_CHARGE = 100;

async function buildCart(sessionId: string) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (items.length === 0) {
    return { sessionId, items: [], subtotal: 0, deliveryCharge: 0, total: 0, itemCount: 0 };
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await db
    .select()
    .from(productsTable)
    .where(
      productIds.length === 1
        ? eq(productsTable.id, productIds[0])
        : eq(productsTable.id, productIds[0])
    );

  const allProducts = await db.select().from(productsTable);
  const productMap: Record<number, any> = {};
  allProducts.forEach((p) => (productMap[p.id] = p));

  const cartItems = items
    .filter((item) => productMap[item.productId])
    .map((item) => {
      const p = productMap[item.productId];
      return {
        productId: item.productId,
        productName: p.name,
        price: parseFloat(p.price),
        quantity: item.quantity,
        imageUrl: p.imageUrl ?? null,
        slug: p.slug,
      };
    });

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const delivery = subtotal > 0 ? DELIVERY_CHARGE : 0;

  return {
    sessionId,
    items: cartItems,
    subtotal,
    deliveryCharge: delivery,
    total: subtotal + delivery,
    itemCount: totalItems,
  };
}

router.get("/cart/:sessionId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const params = GetCartParams.safeParse({ sessionId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  res.json(await buildCart(params.data.sessionId));
});

router.delete("/cart/:sessionId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const params = ClearCartParams.safeParse({ sessionId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, params.data.sessionId));
  res.json(await buildCart(params.data.sessionId));
});

router.post("/cart/:sessionId/items", async (req, res): Promise<void> => {
  const rawSession = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const params = AddCartItemParams.safeParse({ sessionId: rawSession });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AddCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { sessionId } = params.data;
  const { productId, quantity } = body.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, quantity });
  }

  res.json(await buildCart(sessionId));
});

router.patch("/cart/:sessionId/items/:productId", async (req, res): Promise<void> => {
  const rawSession = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const rawProduct = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const params = UpdateCartItemParams.safeParse({
    sessionId: rawSession,
    productId: parseInt(rawProduct, 10),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { sessionId, productId } = params.data;
  const { quantity } = body.data;

  if (quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));
  }

  res.json(await buildCart(sessionId));
});

router.delete("/cart/:sessionId/items/:productId", async (req, res): Promise<void> => {
  const rawSession = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const rawProduct = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const params = RemoveCartItemParams.safeParse({
    sessionId: rawSession,
    productId: parseInt(rawProduct, 10),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { sessionId, productId } = params.data;

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

  res.json(await buildCart(sessionId));
});

export default router;
