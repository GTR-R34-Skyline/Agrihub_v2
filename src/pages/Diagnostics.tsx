import { useState, useRef, useEffect } from "react";
import { Upload, Camera, Leaf, AlertTriangle, CheckCircle, Info, AlertCircle, History } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const crops = [
  { id: "rice", name: "Rice", icon: "🌾" },
  { id: "corn", name: "Corn", icon: "🌽" },
  { id: "tomato", name: "Tomato", icon: "🍅" },
  { id: "potato", name: "Potato", icon: "🥔" },
  { id: "mango", name: "Mango", icon: "🥭" },
  { id: "banana", name: "Banana", icon: "🍌" },
];

interface DiagnosticRecord {
  id: string;
  crop_type: string;
  status: string;
  image_url: string | null;
  diagnosis_result: any;
  notes: string | null;
  created_at: string;
}

interface DiagnosisResult {
  disease_name: string;
  confidence: number;
  severity: string;
  description: string;
  treatment: string;
  prevention: string;
}

const Diagnostics = () => {
  const { user, roles, isLoading: authLoading } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [history, setHistory] = useState<DiagnosticRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBuyer = roles.length > 0 && roles.every(r => r === 'buyer');
  const isFarmer = roles.includes('farmer');
  const isAgronomist = roles.includes('agronomist');

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  // Buyers must never access diagnostics
  if (!authLoading && user && isBuyer) {
    return <Navigate to="/forbidden" replace />;
  }

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('crop_diagnostics')
        .select('id, crop_type, status, image_url, diagnosis_result, notes, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data ?? []);
    } catch (err: any) {
      console.error('Error fetching diagnostics history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
  };

  const handleFile = async (file: File) => {
    if (!user || !selectedCrop) {
      toast.error("Please select a crop type first.");
      return;
    }
    if (!isFarmer) {
      toast.error("Only farmers can submit diagnostics.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }

    setUploading(true);
    setDiagnosisResult(null);
    try {
      // Upload image
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('diagnostic-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('diagnostic-images')
        .getPublicUrl(filePath);

      // Insert diagnostic record
      const { data: insertedRecord, error: insertError } = await supabase
        .from('crop_diagnostics')
        .insert({
          farmer_id: user.id,
          crop_type: selectedCrop,
          image_url: urlData.publicUrl,
          status: 'analyzing',
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      toast.success("Image uploaded! AI analysis in progress...");
      setUploading(false);
      setAnalyzing(true);

      // Call AI analysis edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-crop', {
        body: { imageUrl: urlData.publicUrl, cropType: selectedCrop },
      });

      if (aiError) throw aiError;

      const diagnosis = aiData?.diagnosis;
      if (diagnosis) {
        setDiagnosisResult(diagnosis);

        // Update the diagnostic record with results
        await supabase
          .from('crop_diagnostics')
          .update({
            diagnosis_result: diagnosis,
            status: 'completed',
            notes: `${diagnosis.disease_name} (${diagnosis.severity} severity, ${diagnosis.confidence}% confidence)`,
          })
          .eq('id', insertedRecord.id);
      }

      fetchHistory();
    } catch (err: any) {
      console.error('Error submitting diagnostic:', err);
      toast.error(err.message ?? "Failed to submit diagnostic.");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                AI-Powered
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                Crop Disease{" "}
                <span className="text-gradient">Diagnostics</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {isAgronomist
                  ? "Review submitted crop diagnostics from farmers."
                  : "Upload a photo of your crop and let our AI detect potential diseases, pests, and nutrient deficiencies with treatment recommendations."}
              </p>
            </div>
          </div>
        </section>

        {/* Auth gate */}
        {!user && !authLoading && (
          <section className="py-12">
            <div className="container">
              <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Please sign in to use crop diagnostics.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/auth'}>Sign In</Button>
              </div>
            </div>
          </section>
        )}

        {/* Farmer: Upload tool */}
        {user && isFarmer && (
          <section className="py-12 md:py-20">
            <div className="container">
              <div className="mx-auto max-w-3xl">
                {/* Step 1: Select Crop */}
                <div className="mb-8">
                  <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                    Upload Crop Image
                  </h2>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/heic"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200",
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50",
                      uploading && "pointer-events-none opacity-60"
                    )}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mt-4 text-center font-medium">
                      {uploading ? "Uploading..." : "Drag and drop your image here"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, HEIC (max 10MB)
                    </p>
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-primary">
                    <Info className="h-5 w-5" />
                    Tips for Best Results
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      Take close-up photos of affected leaves or plant parts
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      Ensure good lighting—natural daylight works best
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
        )}

        {/* AI Analysis in Progress */}
        {analyzing && (
          <section className="py-8">
            <div className="container">
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <h3 className="font-display text-xl font-semibold">AI is analyzing your crop...</h3>
                  <p className="text-sm text-muted-foreground">This may take a few seconds</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AI Diagnosis Results */}
        {diagnosisResult && !analyzing && (
          <section className="py-8">
            <div className="container">
              <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-xl font-bold">
                      <Leaf className="h-5 w-5 text-primary" />
                      AI Diagnosis Result
                    </h3>
                    <span className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold uppercase",
                      diagnosisResult.severity === 'none' && "bg-primary/10 text-primary",
                      diagnosisResult.severity === 'low' && "bg-primary/10 text-primary",
                      diagnosisResult.severity === 'moderate' && "bg-warning/10 text-warning",
                      diagnosisResult.severity === 'high' && "bg-destructive/10 text-destructive",
                      diagnosisResult.severity === 'critical' && "bg-destructive/20 text-destructive",
                    )}>
                      {diagnosisResult.severity} severity
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold">{diagnosisResult.disease_name}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${diagnosisResult.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{diagnosisResult.confidence}% confidence</span>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">{diagnosisResult.description}</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                      <h5 className="mb-2 flex items-center gap-1 font-semibold text-primary">
                        <CheckCircle className="h-4 w-4" /> Treatment
                      </h5>
                      <p className="text-sm text-muted-foreground">{diagnosisResult.treatment}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <h5 className="mb-2 flex items-center gap-1 font-semibold">
                        <Info className="h-4 w-4" /> Prevention
                      </h5>
                      <p className="text-sm text-muted-foreground">{diagnosisResult.prevention}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setDiagnosisResult(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {user && (isFarmer || isAgronomist) && (
          <section className="bg-card py-16">
            <div className="container">
              <h2 className="mb-8 flex items-center gap-2 font-display text-2xl font-bold">
                <History className="h-6 w-6" />
                {isAgronomist ? "All Diagnostics" : "Your Diagnostics"}
              </h2>

              {historyLoading && (
                <div className="py-8 text-center text-muted-foreground animate-pulse">Loading history...</div>
              )}

              {!historyLoading && history.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">No diagnostics submitted yet.</div>
              )}

              {!historyLoading && history.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {history.map((record) => (
                    <div key={record.id} className="rounded-xl border border-border bg-background p-4">
                      {record.image_url && (
                        <img src={record.image_url} alt="Crop" className="mb-3 h-40 w-full rounded-lg object-cover" />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{record.crop_type}</span>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          record.status === 'completed' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {record.status}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-16">
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
