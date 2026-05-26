import { useParams, Link } from "wouter";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Star, Minus, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useCartSession } from "@/hooks/use-cart-session";
import {
  useListProducts,
  useGetProduct,
  useListCategories,
  useAddCartItem,
  getGetCartQueryKey,
  getListProductsQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addCartItem = useAddCartItem();

  const { data: categories } = useListCategories();

  const allProductsQuery = useListProducts({ limit: 100 });
  const product = allProductsQuery.data?.products.find((p) => p.slug === slug);

  const relatedParams = { categoryId: product?.categoryId, limit: 4 };
  const { data: relatedList } = useListProducts(relatedParams, {
    query: {
      enabled: !!product?.categoryId,
      queryKey: getListProductsQueryKey(relatedParams),
    },
  });
  const related = relatedList?.products.filter((p) => p.id !== product?.id).slice(0, 4) ?? [];

  const discount =
    product?.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (!sessionId || !product) return;
    addCartItem.mutate(
      { sessionId, data: { productId: product.id, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(sessionId) });
          toast({ title: "Added to cart", description: `${quantity}x ${product.name}` });
        },
        onError: () => {
          toast({ title: "Failed to add", variant: "destructive" });
        },
      }
    );
  };

  if (allProductsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Package className="h-20 w-20 mx-auto mb-4 opacity-20" />
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Link href="/categories">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = categories?.find((c) => c.id === product.categoryId)?.name;
  const categorySlug = categories?.find((c) => c.id === product.categoryId)?.slug;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          {categorySlug && (
            <>
              <Link href={`/categories/${categorySlug}`} className="hover:text-foreground">{categoryName}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div>
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden mb-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="img-product-main"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-20 w-20 opacity-20" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {categoryName && (
              <Link href={`/categories/${categorySlug}`}>
                <Badge variant="outline" className="text-primary border-primary/30 cursor-pointer">
                  {categoryName}
                </Badge>
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" data-testid="text-product-name">
              {product.name}
            </h1>

            {product.rating != null && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(Number(product.rating)) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {Number(product.rating).toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                Rs. {Number(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    Rs. {Number(product.originalPrice).toLocaleString()}
                  </span>
                  {discount && (
                    <Badge className="bg-secondary text-white text-xs">-{discount}%</Badge>
                  )}
                </>
              )}
            </div>

            <Separator />

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  product.stock > 10
                    ? "border-primary/30 text-primary"
                    : product.stock > 0
                    ? "border-yellow-500/30 text-yellow-600"
                    : "border-destructive/30 text-destructive"
                }
              >
                {product.stock > 10
                  ? "In Stock"
                  : product.stock > 0
                  ? `Only ${product.stock} left`
                  : "Out of Stock"}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none"
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold" data-testid="text-quantity">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10 rounded-none"
                  data-testid="button-quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addCartItem.isPending}
                className="flex-1 gap-2"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {addCartItem.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            <Link href="/cart">
              <Button variant="outline" size="lg" className="w-full" data-testid="button-view-cart">
                View Cart
              </Button>
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
