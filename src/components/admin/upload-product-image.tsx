
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  productId: string;
  productName: string;
};

export default function UploadProductImage({
  productId,
  productName,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  async function uploadImage() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setMessage("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > maxSize) {
      setMessage("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    setMessage("");

    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      const extension =
        file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/png"
          ? "png"
          : "webp";

      const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;
      uploadedPath = storagePath;

      const { data: existingImages, error: fetchError } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextSortOrder =
        (existingImages?.[0]?.sort_order ?? -1) + 1;

      const { error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          storage_path: storagePath,
          alt_text: productName,
          sort_order: nextSortOrder,
        });

      if (insertError) throw insertError;

      uploadedPath = null;
      if (fileInputRef.current) fileInputRef.current.value = "";    
      setSelectedFileName("");      
     
      setMessage("Image uploaded successfully.");
      router.refresh();
    } catch (error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError.message);
        }
      }

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-dashed border-fuchsia-300 bg-pink-50 p-4">
      <h3 className="font-semibold text-gray-900">
        Add Another Image
      </h3>

      
<div className="mt-4">
  <label
    htmlFor={`image-upload-${productId}`}
    className="inline-block cursor-pointer rounded-lg bg-white px-5 py-3 font-semibold text-fuchsia-700 shadow-sm ring-1 ring-fuchsia-300 hover:bg-fuchsia-50"
  >
    Choose Image
  </label>

  <input
    id={`image-upload-${productId}`}
    ref={fileInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    disabled={uploading}
    aria-label={`Upload image for ${productName}`}
    className="sr-only"
    onChange={(event) => {
      const file = event.target.files?.[0];

      setSelectedFileName(file?.name ?? "");
      setMessage("");
    }}
  />

  <p className="mt-3 text-sm text-gray-600">
    {selectedFileName || "No image selected"}
  </p>
</div>


      <button
        type="button"
        onClick={uploadImage}
        disabled={uploading}
        className="mt-3 rounded-lg bg-fuchsia-700 px-5 py-2 font-semibold text-white hover:bg-fuchsia-800 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {message && (
        <p role="status" className="mt-3 text-sm text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
}
