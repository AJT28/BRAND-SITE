
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  imageId: string;
  productId: string;
  isMain: boolean;
};

export default function SetMainImageButton({
  imageId,
  productId,
  isMain,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function setMainImage() {
    if (isMain || saving) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      // Assign the selected image a sort order lower
      // than the current main image.
      const { data: images, error: fetchError } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .limit(1);

      if (fetchError) throw fetchError;

      const lowestSortOrder = images?.[0]?.sort_order ?? 0;

      const { data, error: updateError } = await supabase
        .from("product_images")
        .update({
          sort_order: lowestSortOrder - 1,
        })
        .eq("id", imageId)
        .eq("product_id", productId)
        .select("id")
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error("Image was not updated.");

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to set main image."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={setMainImage}
        disabled={isMain || saving}
        className={`w-full rounded-lg px-3 py-2 text-xs font-semibold ${
          isMain
            ? "cursor-default bg-green-100 text-green-800"
            : "bg-fuchsia-700 text-white hover:bg-fuchsia-800"
        } disabled:opacity-70`}
      >
        {isMain
          ? "Current Main Image"
          : saving
          ? "Saving..."
          : "Set as Main"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
