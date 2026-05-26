import { useParams, Link } from "wouter";
import { useState } from "react";
import { ArrowLeft, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import {
  useListCategories,
  useListProducts,
  getListProductsQueryKey,
} from "@/api";

export default function CategoryProducts() {
  const { slug } = useParams();
  const [search, setSearch] = useState("");

  const { data: categories } = useListCategories();
  const category = categories?.find((c) => c.slug === slug);

  const params = {
    categoryId: category?.id,
    search: search || undefined,
    limit: 24,
  };

  const { data: productList, isLoading } = useListProducts(params, {
    query: {
      enabled: !!category?.id,
      queryKey: getListProductsQueryKey(params),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link href="/categories">
            <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4" /> Back to Categories
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{category?.name ?? "Category"}</h1>
              {category?.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
              {productList && (
                <p className="text-sm text-muted-foreground mt-1">
                  {productList.total} products found
                </p>
              )}
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in this category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : productList && productList.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {productList.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <SlidersHorizontal className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
