import { useState } from "react";
import { Upload, Camera, Leaf, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const crops = [
  { id: "rice", name: "Rice", icon: "🌾" },
  { id: "corn", name: "Corn", icon: "🌽" },
  { id: "tomato", name: "Tomato", icon: "🍅" },
  { id: "potato", name: "Potato", icon: "🥔" },
  { id: "mango", name: "Mango", icon: "🥭" },
  { id: "banana", name: "Banana", icon: "🍌" },
];

const Diagnostics = () => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-info/5 via-background to-success/5 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-info/10 px-4 py-1.5 text-sm font-medium text-info">
                AI-Powered
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                Crop Disease{" "}
                <span className="text-gradient">Diagnostics</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Upload a photo of your crop and let our AI detect potential diseases, 
                pests, and nutrient deficiencies with treatment recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* Diagnostics Tool */}
        <section className="py-12 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              {/* Step 1: Select Crop */}
              <div className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </span>
                  Select Your Crop
                </h2>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {crops.map((crop) => (
                    <button
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                        selectedCrop === crop.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-muted"
                      )}
                    >
                      <span className="text-3xl">{crop.icon}</span>
                      <span className="text-xs font-medium">{crop.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Upload Image */}
              <div className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </span>
                  Upload Crop Image
                </h2>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mt-4 text-center font-medium">
                    Drag and drop your image here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, HEIC (max 10MB)
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl border border-info/20 bg-info/5 p-6">
                <h3 className="flex items-center gap-2 font-semibold text-info">
                  <Info className="h-5 w-5" />
                  Tips for Best Results
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    Take close-up photos of affected leaves or plant parts
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    Ensure good lighting—natural daylight works best
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    Include both healthy and affected areas if possible
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                    Avoid blurry or over-exposed images
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-card py-16">
          <div className="container">
            <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
              How AI Diagnostics Works
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {[
                { icon: Camera, title: "Capture", desc: "Take or upload a photo of your crop" },
                { icon: Leaf, title: "Analyze", desc: "Our AI scans for signs of disease" },
                { icon: AlertTriangle, title: "Diagnose", desc: "Get accurate disease identification" },
                { icon: CheckCircle, title: "Treat", desc: "Receive treatment recommendations" },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={cn("text-center animate-fade-up opacity-0")}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Diagnostics;
