import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Grid3X3, List, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// Comprehensive Indian agricultural products
const mockProducts = [
  // Premium Spices
  {
    id: "1",
    title: "Kashmiri Saffron (Kesar)",
    price: 45000,
    unit: "100g",
    location: "Pampore, Kashmir",
    seller: "Kashmir Valley Farms",
    image: "🌸",
    category: "spices",
    isOrganic: true,
    rating: 4.9,
  },
  {
    id: "2",
    title: "Kerala Malabar Black Pepper",
    price: 850,
    unit: "kg",
    location: "Wayanad, Kerala",
    seller: "Spice Garden Coop",
    image: "🌶️",
    category: "spices",
    isOrganic: true,
    rating: 4.8,
  },
  {
    id: "3",
    title: "Guntur Red Chillies",
    price: 320,
    unit: "kg",
    location: "Guntur, Andhra Pradesh",
    seller: "Andhra Mirchi Traders",
    image: "🌶️",
    category: "spices",
    isOrganic: false,
    rating: 4.7,
  },
  {
    id: "4",
    title: "Cardamom (Elaichi) - Green",
    price: 2800,
    unit: "kg",
    location: "Idukki, Kerala",
    seller: "Cardamom Hills Estate",
    image: "🫛",
    category: "spices",
    isOrganic: true,
    rating: 4.9,
  },
  // Teas
  {
    id: "5",
    title: "Darjeeling First Flush Tea",
    price: 1800,
    unit: "kg",
    location: "Darjeeling, West Bengal",
    seller: "Makaibari Tea Estate",
    image: "🍵",
    category: "beverages",
    isOrganic: true,
    rating: 4.9,
  },
  {
    id: "6",
    title: "Assam CTC Premium Tea",
    price: 480,
    unit: "kg",
    location: "Jorhat, Assam",
    seller: "Brahmaputra Tea Gardens",
    image: "🍵",
    category: "beverages",
    isOrganic: false,
    rating: 4.6,
  },
  {
    id: "7",
    title: "Nilgiri Blue Mountain Tea",
    price: 950,
    unit: "kg",
    location: "Coonoor, Tamil Nadu",
    seller: "Nilgiri Organic Farms",
    image: "🍵",
    category: "beverages",
    isOrganic: true,
    rating: 4.7,
  },
  // Grains & Rice
  {
    id: "8",
    title: "Basmati Rice - 1121 Extra Long",
    price: 180,
    unit: "kg",
    location: "Karnal, Haryana",
    seller: "Punjab Agro Exports",
    image: "🌾",
    category: "grains",
    isOrganic: false,
    rating: 4.8,
  },
  {
    id: "9",
    title: "Red Rice (Matta Rice)",
    price: 95,
    unit: "kg",
    location: "Palakkad, Kerala",
    seller: "Kerala Grains Co.",
    image: "🌾",
    category: "grains",
    isOrganic: true,
    rating: 4.5,
  },
  {
    id: "10",
    title: "Organic Ragi (Finger Millet)",
    price: 75,
    unit: "kg",
    location: "Hassan, Karnataka",
    seller: "Deccan Millets Coop",
    image: "🌾",
    category: "grains",
    isOrganic: true,
    rating: 4.6,
  },
  {
    id: "11",
    title: "Jowar (Sorghum) Premium",
    price: 55,
    unit: "kg",
    location: "Solapur, Maharashtra",
    seller: "Maharashtra Farmers Union",
    image: "🌾",
    category: "grains",
    isOrganic: true,
    rating: 4.4,
  },
  // Fruits
  {
    id: "12",
    title: "Alphonso Mangoes (Hapus)",
    price: 650,
    unit: "dozen",
    location: "Ratnagiri, Maharashtra",
    seller: "Konkan Mango Farms",
    image: "🥭",
    category: "fruits",
    isOrganic: true,
    rating: 4.9,
  },
  {
    id: "13",
    title: "Nagpur Oranges (Santra)",
    price: 120,
    unit: "kg",
    location: "Nagpur, Maharashtra",
    seller: "Vidarbha Citrus Growers",
    image: "🍊",
    category: "fruits",
    isOrganic: false,
    rating: 4.5,
  },
  {
    id: "14",
    title: "Banganapalli Mangoes",
    price: 380,
    unit: "dozen",
    location: "Kurnool, Andhra Pradesh",
    seller: "Rayalaseema Farms",
    image: "🥭",
    category: "fruits",
    isOrganic: false,
    rating: 4.7,
  },
  {
    id: "15",
    title: "Kashmir Apples (Delicious)",
    price: 180,
    unit: "kg",
    location: "Shopian, Kashmir",
    seller: "Valley Apple Orchards",
    image: "🍎",
    category: "fruits",
    isOrganic: true,
    rating: 4.8,
  },
  // Vegetables
  {
    id: "16",
    title: "Fresh Turmeric (Haldi)",
    price: 140,
    unit: "kg",
    location: "Sangli, Maharashtra",
    seller: "Sangli Haldi Mandal",
    image: "🧡",
    category: "vegetables",
    isOrganic: true,
    rating: 4.6,
  },
  {
    id: "17",
    title: "Ginger (Adrak) - Export Quality",
    price: 160,
    unit: "kg",
    location: "Cochin, Kerala",
    seller: "Kerala Spices Board",
    image: "🫚",
    category: "vegetables",
    isOrganic: true,
    rating: 4.7,
  },
  {
    id: "18",
    title: "Drumstick (Moringa)",
    price: 80,
    unit: "kg",
    location: "Coimbatore, Tamil Nadu",
    seller: "Tamil Organic Farms",
    image: "🥬",
    category: "vegetables",
    isOrganic: true,
    rating: 4.4,
  },
  // Pulses
  {
    id: "19",
    title: "Toor Dal (Arhar) Premium",
    price: 165,
    unit: "kg",
    location: "Latur, Maharashtra",
    seller: "Marathwada Pulses",
    image: "🫘",
    category: "pulses",
    isOrganic: false,
    rating: 4.5,
  },
  {
    id: "20",
    title: "Chana Dal - Organic",
    price: 130,
    unit: "kg",
    location: "Indore, Madhya Pradesh",
    seller: "MP Organic Farmers",
    image: "🫘",
    category: "pulses",
    isOrganic: true,
    rating: 4.6,
  },
  {
    id: "21",
    title: "Masoor Dal (Red Lentils)",
    price: 110,
    unit: "kg",
    location: "Raipur, Chhattisgarh",
    seller: "Chhattisgarh Dal Union",
    image: "🫘",
    category: "pulses",
    isOrganic: false,
    rating: 4.4,
  },
  // Dairy
  {
    id: "22",
    title: "A2 Gir Cow Ghee",
    price: 2200,
    unit: "kg",
    location: "Junagadh, Gujarat",
    seller: "Gir Gaushala",
    image: "🧈",
    category: "dairy",
    isOrganic: true,
    rating: 4.9,
  },
  {
    id: "23",
    title: "Fresh Buffalo Milk",
    price: 80,
    unit: "liter",
    location: "Anand, Gujarat",
    seller: "Amul Dairy Cooperative",
    image: "🥛",
    category: "dairy",
    isOrganic: false,
    rating: 4.7,
  },
  {
    id: "24",
    title: "Paneer - Farm Fresh",
    price: 380,
    unit: "kg",
    location: "Ludhiana, Punjab",
    seller: "Punjab Dairy Farms",
    image: "🧀",
    category: "dairy",
    isOrganic: false,
    rating: 4.6,
  },
  // Oils
  {
    id: "25",
    title: "Cold Pressed Groundnut Oil",
    price: 320,
    unit: "liter",
    location: "Junagadh, Gujarat",
    seller: "Gujarat Oilseeds Coop",
    image: "🫒",
    category: "oils",
    isOrganic: true,
    rating: 4.7,
  },
  {
    id: "26",
    title: "Virgin Coconut Oil",
    price: 450,
    unit: "liter",
    location: "Pollachi, Tamil Nadu",
    seller: "Coconut Producers Fed.",
    image: "🥥",
    category: "oils",
    isOrganic: true,
    rating: 4.8,
  },
  {
    id: "27",
    title: "Mustard Oil - Kachi Ghani",
    price: 220,
    unit: "liter",
    location: "Alwar, Rajasthan",
    seller: "Rajasthan Oil Mills",
    image: "🫒",
    category: "oils",
    isOrganic: false,
    rating: 4.5,
  },
];

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      unit: product.unit,
      image: product.image,
      seller: product.seller,
      location: product.location,
      isOrganic: product.isOrganic,
    });
    toast.success(`${product.title} added to cart`);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-gradient-alluvial">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-card py-12">
          <div className="container">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Marketplace</h1>
            <p className="mt-2 text-muted-foreground">
              Discover premium agricultural products from verified Indian farmers — from Kashmir to Kanyakumari.
            </p>

            {/* Search & Filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for Darjeeling tea, Kashmiri saffron, Basmati rice..."
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
                All Products
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
              Showing {filteredProducts.length} products from across India
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
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300",
                    "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1",
                    viewMode === "list" && "flex"
                  )}
                >
                  {/* Image */}
                  <div
                    className={cn(
                      "relative flex items-center justify-center bg-muted text-6xl",
                      viewMode === "grid" ? "aspect-square" : "h-32 w-32 flex-shrink-0"
                    )}
                  >
                    {product.image}
                    {product.isOrganic && (
                      <Badge className="absolute top-2 left-2 bg-success text-success-foreground">
                        Organic
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${product.id}`} className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-amber-500 flex-shrink-0">
                        <Star className="h-3 w-3 fill-current" />
                        {product.rating}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{product.location}</p>
                    <p className="mt-1 text-xs text-muted-foreground">by {product.seller}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{product.price.toLocaleString('en-IN')}
                        <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
                      </span>
                      <Button size="sm" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                    </div>
                  </div>
                </motion.div>
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
