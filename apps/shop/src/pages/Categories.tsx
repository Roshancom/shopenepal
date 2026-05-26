import { Link } from "wouter";
import { ArrowRight, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { useListCategories, useGetStoreStats } from "@/api";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();
  const { data: stats } = useGetStoreStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Categories</h1>
          <p className="text-muted-foreground">
            Browse {stats?.totalCategories ?? 0} categories with {stats?.totalProducts ?? 0}+ products
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(categories ?? []).map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}>
                <div
                  className="group bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  data-testid={`card-category-${cat.id}`}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/30">{cat.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-1">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{cat.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        <span>{cat.productCount} products</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!categories || categories.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No categories yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
