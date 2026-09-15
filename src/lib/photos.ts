import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PHOTO_BUCKET = "meal-photos";

/** Downscale + re-encode to keep uploads small. Falls back to the original file. */
async function compress(file: File, maxSize = 1400): Promise<Blob> {
  if (typeof document === "undefined" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function uploadPhoto(file: File): Promise<string> {
  const blob = await compress(file);
  const path = `photos/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error("Photo upload failed. Please try again.");
  return path;
}

export async function deletePhoto(path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

export function usePhotoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["photo-url", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 45,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(path as string, 60 * 60);
      if (error) return null;
      return data.signedUrl;
    },
  });
}
