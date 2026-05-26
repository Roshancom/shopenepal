import { Link } from "wouter";
import { ArrowRight, Truck, Shield, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import {
  useListCategories,
  useGetFeaturedProducts,
  useGetNewArrivals,
  useGetStoreStats,
} from "@/api";

export default function Home() {
  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: featured, isLoading: featuredLoading } =
    useGetFeaturedProducts();
  const { data: newArrivals, isLoading: newLoading } = useGetNewArrivals();
  const { data: stats } = useGetStoreStats();
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeFeatured = Array.isArray(featured) ? featured : [];
  const safeNewArrivals = Array.isArray(newArrivals) ? newArrivals : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                Nepal's Trusted Online Store
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Shop Smart,
                <br />
                <span className="text-primary">Pay with eSewa</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Discover thousands of products from electronics to fashion. Fast
                delivery across Nepal with secure eSewa payments.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/categories">
                  <Button
                    size="lg"
                    className="gap-2"
                    data-testid="button-shop-now"
                  >
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button
                    size="lg"
                    variant="outline"
                    data-testid="button-track-order"
                  >
                    Track Order
                  </Button>
                </Link>
              </div>
              {stats && (
                <div className="flex gap-6 pt-2">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {stats.totalProducts}+
                    </p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {stats.totalCategories}+
                    </p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {stats.featuredCount}+
                    </p>
                    <p className="text-xs text-muted-foreground">Featured</p>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border border-primary/10 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 p-6 w-full">
                    {[
                      { label: "Electronics", color: "bg-primary/15" },
                      { label: "Fashion", color: "bg-secondary/15" },
                      { label: "Home", color: "bg-yellow-400/15" },
                      { label: "Sports", color: "bg-purple-400/15" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`${item.color} rounded-xl p-4 flex items-center justify-center`}
                      >
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* eSewa Banner */}
      <div className="bg-gradient-to-r from-[#60BB46] to-[#45a332] text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-sm">
          <Zap className="h-4 w-4" />
          <span className="font-medium">
            Pay securely with eSewa — Nepal's #1 digital wallet
          </span>
        </div>
      </div>

      {/* Features */}
      <section className="py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Fast Delivery", sub: "Across Nepal" },
              {
                icon: Shield,
                label: "Secure Payments",
                sub: "eSewa protected",
              },
              { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
              { icon: Zap, label: "24/7 Support", sub: "Always here" },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 p-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Browse Categories</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Find what you're looking for
              </p>
            </div>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {catsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {safeCategories.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`}>
                  <div
                    className="group relative bg-card border border-card-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                    data-testid={`card-category-${cat.id}`}
                  >
                    {cat.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {cat.name[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-center line-clamp-2">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cat.productCount} items
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Handpicked for you
              </p>
            </div>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {safeFeatured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">New Arrivals</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Just landed in store
              </p>
            </div>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {newLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {safeNewArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-xl">ShopeNepal</span>
              </div>
              <p className="text-sm opacity-70">
                Nepal's trusted online shopping destination.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <Link href="/categories" className="hover:opacity-100">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:opacity-100">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:opacity-100">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Payment</h4>
              <div className="flex items-center gap-2">
                <div className="bg-[#60BB46] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  eSewa
                </div>
                <span className="text-sm opacity-70">Secure payments</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-background/20 text-center text-sm opacity-50">
            2024 ShopeNepal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
