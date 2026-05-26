import { useState } from "react";
import { Link } from "wouter";
import { Package, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { useListOrders, getListOrdersQueryKey } from "@/api";
import { useCartSession } from "@/hooks/use-cart-session";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
};

export default function Orders() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const sessionId = useCartSession();

  const params = searchEmail ? { email: searchEmail } : { sessionId: sessionId || undefined };

  const { data: orders, isLoading } = useListOrders(params, {
    query: {
      enabled: !!(searchEmail || sessionId),
      queryKey: getListOrdersQueryKey(params),
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(email);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground text-sm">Track your orders or search by email</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              data-testid="input-email-search"
            />
          </div>
          <Button type="submit" data-testid="button-search-orders">Search</Button>
        </form>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-card-border rounded-xl p-5 space-y-4"
                data-testid={`card-order-${order.id}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-NP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={STATUS_COLORS[order.status] ?? "bg-muted"}>
                      {order.status}
                    </Badge>
                    <Badge className={PAYMENT_COLORS[order.paymentStatus] ?? "bg-muted"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.productName} x{item.quantity}
                      </span>
                      <span>Rs. {(Number(item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Delivery: </span>
                    <span>{order.shippingAddress}, {order.city}</span>
                  </div>
                  <div className="font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
                    Rs. {Number(order.total).toLocaleString()}
                  </div>
                </div>

                {order.esewaRefId && (
                  <div className="text-xs text-muted-foreground">
                    eSewa Ref: {order.esewaRefId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && orders && orders.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mb-6">Start shopping to see your orders here</p>
            <Link href="/categories">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
