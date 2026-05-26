import { Link, useLocation } from "wouter";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, useCreateOrder } from "@/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().min(10, "Phone number required"),
  shippingAddress: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const sessionId = useCartSession();
  const createOrder = useCreateOrder();

  const [, setLocation] = useLocation();

  const { data: cart, isLoading } = useGetCart(sessionId, {
    query: { enabled: !!sessionId, queryKey: ["cart", sessionId] },
  });

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
    },
  });

  const onSubmit = (values: CheckoutValues) => {
    if (!sessionId) return;
    createOrder.mutate(
      {
        data: {
          ...values,
          sessionId,
          paymentMethod: "esewa",
        },
      },
      {
        onSuccess: (result) => {
          setLocation("/order-success");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link href="/categories">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/cart">
          <Button variant="ghost" size="sm" className="gap-1 mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Button>
        </Link>

        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
                  <h2 className="font-semibold text-lg">
                    Delivery Information
                  </h2>
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="98XXXXXXXX"
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Street, area, landmark..."
                            {...field}
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Kathmandu"
                            {...field}
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-[#60BB46]/10 border border-[#60BB46]/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="bg-[#60BB46] text-white text-sm font-bold px-3 py-1.5 rounded-lg flex-shrink-0">
                    eSewa
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pay with eSewa</p>
                    <p className="text-xs text-muted-foreground">
                      Nepal's most trusted digital wallet
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-[#60BB46] hover:bg-[#45a332] text-white"
                  disabled={createOrder.isPending}
                  data-testid="button-pay-esewa"
                >
                  <Zap className="h-5 w-5" />
                  {createOrder.isPending
                    ? "Processing..."
                    : `Pay Rs. ${Number(cart?.total ?? 0).toLocaleString()} with eSewa`}
                </Button>
              </form>
            </Form>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card border border-card-border rounded-xl p-5 sticky top-20">
              <h2 className="font-semibold text-base mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="flex-shrink-0">
                      Rs.{" "}
                      {(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    Rs. {Number(cart?.subtotal ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    Rs. {Number(cart?.deliveryCharge ?? 100).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span
                    className="text-primary"
                    data-testid="text-checkout-total"
                  >
                    Rs. {Number(cart?.total ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
