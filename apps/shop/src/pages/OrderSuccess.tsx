import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle, XCircle, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useVerifyPayment } from "@/api";

export default function OrderSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const encodedData = params.get("data");

  const [verified, setVerified] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [order, setOrder] = useState<any>(null);

  const verifyPayment = useVerifyPayment();

  useEffect(() => {
    if (!encodedData || verified) return;

    let parsedOrderId: number | null = null;
    try {
      const decoded = atob(encodedData);
      const parsed = JSON.parse(decoded);
      parsedOrderId = parsed.transaction_uuid
        ? parseInt(parsed.transaction_uuid.split("-")[0], 10)
        : null;
    } catch {
      parsedOrderId = null;
    }

    if (!parsedOrderId) return;
    setOrderId(parsedOrderId);
    setVerified(true);

    verifyPayment.mutate(
      { id: parsedOrderId, data: { data: encodedData } },
      {
        onSuccess: (result) => {
          setOrder(result);
        },
      }
    );
  }, [encodedData]);

  const isPending = verifyPayment.isPending;
  const isSuccess = !!order && order.paymentStatus === "paid";
  const isFailed = verifyPayment.isError;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isPending && (
          <div className="text-center space-y-4">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        )}

        {!isPending && isSuccess && order && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">Your order has been placed successfully</p>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Order #{order.id}</h2>
                <Badge className="bg-primary/10 text-primary">
                  {order.status}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery to</span>
                  <span className="text-right">{order.shippingAddress}, {order.city}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.productName} x{item.quantity}</span>
                    <span>Rs. {(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span className="text-primary">Rs. {Number(order.total).toLocaleString()}</span>
              </div>
              {order.esewaRefId && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>eSewa Ref ID</span>
                  <span>{order.esewaRefId}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>
              <Link href="/orders" className="flex-1">
                <Button className="w-full gap-2" data-testid="button-view-orders">
                  <Package className="h-4 w-4" /> My Orders
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isPending && (isFailed || (!isSuccess && !isPending && order)) && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-destructive mb-2">Payment Failed</h1>
              <p className="text-muted-foreground">Something went wrong with your payment. Please try again.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/cart" className="flex-1">
                <Button className="w-full" data-testid="button-try-again">Try Again</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">Home</Button>
              </Link>
            </div>
          </div>
        )}

        {!encodedData && !isPending && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-primary opacity-50" />
            <h1 className="text-2xl font-bold">Order Placed!</h1>
            <p className="text-muted-foreground">Your order is being processed.</p>
            <Link href="/orders">
              <Button className="gap-2">View Orders <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
