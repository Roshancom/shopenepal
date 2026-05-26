import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAddCartItem, useGetCart, getGetCartQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
  rating?: number | null;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addCartItem = useAddCartItem();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sessionId) return;
    addCartItem.mutate(
      { sessionId, data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(sessionId) });
          toast({ title: "Added to cart", description: product.name });
        },
        onError: () => {
          toast({ title: "Failed to add", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group bg-card rounded-xl border border-card-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
              <ShoppingCart className="h-12 w-12 opacity-20" />
            </div>
          )}
          {discount && discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-secondary text-white text-xs">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-primary text-white text-xs">
              Featured
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {product.categoryName && (
            <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
          )}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>

          {product.rating != null && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {Number(product.rating).toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-bold text-foreground" data-testid={`text-price-${product.id}`}>
                Rs. {Number(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through ml-1">
                  Rs. {Number(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addCartItem.isPending}
              className="h-8 px-3 text-xs"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
