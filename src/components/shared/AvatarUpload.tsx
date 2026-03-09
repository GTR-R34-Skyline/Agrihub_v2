import { useState, useRef } from "react";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export const AvatarUpload = ({ currentUrl, onUploaded }: AvatarUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB."); return; }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      // Upload using product-images bucket as fallback since avatars bucket may not exist
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);

      // Update profile
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("user_id", user.id);

      onUploaded(data.publicUrl);
      toast.success("Avatar updated!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload avatar.");
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div
        className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer relative"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">👤</span>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
    </div>
  );
};
