
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  imageId: string;
  productId: string;
  storagePath: string;
};

export default function DeleteProductImageButton({
  imageId,
  productId,
  storagePath,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function deleteImage() {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this product image?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      // Delete the file from Supabase Storage.
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete the matching database record.
      const { data, error: databaseError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId)
        .eq("product_id", productId)
        .eq("storage_path", storagePath)
        .select("id")
        .single();

      if (databaseError) throw databaseError;

      if (!data) {
        throw new Error("Image record was not deleted.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete image."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={deleteImage}
        disabled={deleting}
        className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Image"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
