import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { useCartSession } from "@/hooks/use-cart-session";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  getGetCartQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart, isLoading } = useGetCart(sessionId, {
    query: { enabled: !!sessionId },
  });

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const invalidateCart = () => {
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(sessionId) });
  };

  const handleUpdateQty = (productId: number, quantity: number) => {
    if (!sessionId) return;
    if (quantity <= 0) {
      removeItem.mutate({ sessionId, productId }, { onSuccess: invalidateCart });
      return;
    }
    updateItem.mutate(
      { sessionId, productId, data: { quantity } },
      { onSuccess: invalidateCart }
    );
  };

  const handleRemove = (productId: number) => {
    if (!sessionId) return;
    removeItem.mutate({ sessionId, productId }, { onSuccess: invalidateCart });
  };

  const handleClear = () => {
    if (!sessionId) return;
    clearCart.mutate({ sessionId }, {
      onSuccess: () => {
        invalidateCart();
        toast({ title: "Cart cleared" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Skeleton className="h-8 w-40 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 mb-3 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <ShoppingCart className="h-20 w-20 mx-auto mb-4 opacity-20" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Link href="/categories">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart ({cart?.itemCount ?? 0} items)</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleClear}
            disabled={clearCart.isPending}
            data-testid="button-clear-cart"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Clear all
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-card border border-card-border rounded-xl p-4"
                data-testid={`card-cart-item-${item.productId}`}
              >
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="h-6 w-6 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
                      {item.productName}
                    </h3>
                  </Link>
                  <p className="text-primary font-bold mt-1" data-testid={`text-price-${item.productId}`}>
                    Rs. {Number(item.price).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleRemove(item.productId)}
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold">
                    Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-card border border-card-border rounded-xl p-5 sticky top-20">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {Number(cart?.subtotal ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>Rs. {Number(cart?.deliveryCharge ?? 100).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-cart-total">
                    Rs. {Number(cart?.total ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full mt-5 gap-2" size="lg" data-testid="button-checkout">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="ghost" className="w-full mt-2 gap-1" size="sm">
                  <ArrowLeft className="h-4 w-4" /> Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
