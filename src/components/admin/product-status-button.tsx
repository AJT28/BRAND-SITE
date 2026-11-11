
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProductStatus = "draft" | "published" | "archived";

type Props = {
  productId: string;
  currentStatus: ProductStatus;
};

export default function ProductStatusButton({
  productId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isPublished = currentStatus === "published";
  const nextStatus = isPublished ? "draft" : "published";

  async function handleStatusChange() {
    const action = isPublished ? "unpublish" : "publish";

    if (!window.confirm(`Are you sure you want to ${action} this product?`)) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .select("id, status")
        .single();

      if (error) throw error;

      if (data?.status !== nextStatus) {
        throw new Error("Product status was not updated.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update product status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleStatusChange}
        disabled={loading}
        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
          isPublished
            ? "bg-orange-600"
            : "bg-green-700"
        }`}
      >
        {loading
          ? "Updating..."
          : isPublished
          ? "Unpublish"
          : "Publish"}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
