import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, Menu, X, Home, Grid3X3, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart } from "@/api";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const sessionId = useCartSession();
  const { data: cart } = useGetCart(sessionId, {
    query: { enabled: !!sessionId },
  });
  const itemCount = cart?.itemCount ?? 0;

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "/orders", label: "Orders", icon: Package },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">
              Shope<span className="text-primary">Nepal</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link key={href} href={href}>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  data-testid={`nav-link-${label.toLowerCase()}`}
                >
                  {label}
                </button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="nav-cart-button"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="nav-mobile-toggle"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location === href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`mobile-nav-link-${label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
