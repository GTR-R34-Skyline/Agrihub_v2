import { useState } from "react";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Mock products for demo
const mockProducts = [
  {
    id: "1",
    title: "Fresh Organic Basmati Rice",
    price: 120,
    unit: "kg",
    location: "Punjab",
    seller: "Rajesh Kumar",
    image: "🌾",
    category: "grains",
  },
  {
    id: "2",
    title: "Premium Tomatoes",
    price: 60,
    unit: "kg",
    location: "Maharashtra",
    seller: "Amit Sharma",
    image: "🍅",
    category: "vegetables",
  },
  {
    id: "3",
    title: "Free Range Eggs",
    price: 180,
    unit: "tray",
    location: "Karnataka",
    seller: "Priya Farms",
    image: "🥚",
    category: "poultry",
  },
  {
    id: "4",
    title: "Fresh Buffalo Milk",
    price: 70,
    unit: "liter",
    location: "Gujarat",
    seller: "Amul Dairy Co",
    image: "🥛",
    category: "dairy",
  },
  {
    id: "5",
    title: "Alphonso Mangoes",
    price: 450,
    unit: "kg",
    location: "Ratnagiri",
    seller: "Konkan Farms",
    image: "🥭",
    category: "fruits",
  },
  {
    id: "6",
    title: "Hybrid Maize Seeds",
    price: 850,
    unit: "pack",
    location: "Andhra Pradesh",
    seller: "AgriSeeds India",
    image: "🌽",
    category: "seeds",
  },
];

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-card py-12">
          <div className="container">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Marketplace</h1>
            <p className="mt-2 text-muted-foreground">
              Browse fresh agricultural products from verified farmers and suppliers.
            </p>

            {/* Search & Filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
                <div className="flex rounded-lg border border-border">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-border bg-background py-4">
          <div className="container">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    selectedCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8">
          <div className="container">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </div>
            
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={cn(
                    "group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300",
                    "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1",
                    "animate-fade-up opacity-0",
                    viewMode === "list" && "flex"
                  )}
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                >
                  {/* Image */}
                  <div
                    className={cn(
                      "flex items-center justify-center bg-muted text-6xl",
                      viewMode === "grid" ? "aspect-square" : "h-32 w-32 flex-shrink-0"
                    )}
                  >
                    {product.image}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{product.location}</p>
                    <p className="mt-1 text-xs text-muted-foreground">by {product.seller}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{product.price}
                        <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
                      </span>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-6xl">🔍</span>
                <h3 className="mt-4 font-display text-xl font-semibold">No products found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
