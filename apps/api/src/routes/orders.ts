import { Router, type IRouter } from "express";
import { db, ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";
import {
  CreateOrderBody,
  GetOrderParams,
  ListOrdersQueryParams,
  VerifyPaymentParams,
  VerifyPaymentBody,
} from "../schemas";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DELIVERY_CHARGE = 100;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q";

function generateSignature(message: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

function buildOrderResponse(order: any) {
  return {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    city: order.city,
    items: order.items as any[],
    subtotal: parseFloat(order.subtotal),
    deliveryCharge: parseFloat(order.deliveryCharge),
    total: parseFloat(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    esewaRefId: order.esewaRefId ?? null,
    createdAt:
      order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : String(order.createdAt),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { email, sessionId } = query.data;

  if (!email && !sessionId) {
    res.json([]);
    return;
  }

  let orders;
  if (email && sessionId) {
    orders = await db
      .select()
      .from(ordersTable)
      .where(
        or(
          eq(ordersTable.customerEmail, email),
          eq(ordersTable.sessionId, sessionId),
        ),
      )
      .orderBy(ordersTable.createdAt);
  } else if (email) {
    orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.customerEmail, email))
      .orderBy(ordersTable.createdAt);
  } else {
    orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.sessionId, sessionId!))
      .orderBy(ordersTable.createdAt);
  }

  res.json(orders.map(buildOrderResponse));
});

router.post("/orders", async (req, res): Promise<void> => {
  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    sessionId,
    paymentMethod,
  } = body.data;

  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const allProducts = await db.select().from(productsTable);
  const productMap: Record<number, any> = {};
  allProducts.forEach((p) => (productMap[p.id] = p));

  const orderItems = cartItems
    .filter((item) => productMap[item.productId])
    .map((item) => {
      const p = productMap[item.productId];
      return {
        productId: item.productId,
        productName: p.name,
        price: parseFloat(p.price),
        quantity: item.quantity,
        imageUrl: p.imageUrl ?? null,
      };
    });

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_CHARGE;
  const transactionUuid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  await db.insert(ordersTable).values({
    sessionId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    items: orderItems,
    subtotal: subtotal.toString(),
    deliveryCharge: DELIVERY_CHARGE.toString(),
    total: total.toString(),
    status: "pending",
    paymentStatus: "pending",
    paymentMethod,
    transactionUuid,
  });

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.transactionUuid, transactionUuid));

  if (!order) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const successUrl = `${process.env.APP_URL ?? ""}/order-success`;
  const failureUrl = `${process.env.APP_URL ?? ""}/checkout`;

  const signedFields = "total_amount,transaction_uuid,product_code";
  const messageToSign = `total_amount=${total},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = generateSignature(messageToSign, ESEWA_SECRET_KEY);

  const esewaParams = {
    amount: subtotal.toString(),
    tax_amount: "0",
    total_amount: total.toString(),
    transaction_uuid: transactionUuid,
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: "0",
    product_delivery_charge: DELIVERY_CHARGE.toString(),
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: signedFields,
    signature,
  };

  res.status(201).json({ order: buildOrderResponse(order), esewaParams });
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(buildOrderResponse(order));
});

router.post("/orders/:id/verify-payment", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = VerifyPaymentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = VerifyPaymentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  let esewaData: any = {};
  try {
    const decoded = Buffer.from(body.data.data, "base64").toString("utf-8");
    esewaData = JSON.parse(decoded);
  } catch (e) {
    req.log.warn("Failed to decode eSewa response data");
  }

  const esewaStatus =
    (esewaData.status ?? esewaData.transaction_code) ? "COMPLETE" : "FAILED";
  const refId = esewaData.transaction_code ?? esewaData.ref_id ?? null;

  if (esewaStatus === "COMPLETE" || esewaData.status === "COMPLETE") {
    await db
      .update(ordersTable)
      .set({
        paymentStatus: "paid",
        status: "processing",
        esewaRefId: refId,
      })
      .where(eq(ordersTable.id, params.data.id));

    const [updated] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, params.data.id));

    res.json(buildOrderResponse(updated));
  } else {
    await db
      .update(ordersTable)
      .set({ paymentStatus: "failed" })
      .where(eq(ordersTable.id, params.data.id));

    const [updated] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, params.data.id));

    res
      .status(400)
      .json({
        error: "Payment not completed",
        order: buildOrderResponse(updated),
      });
  }
});

export default router;
