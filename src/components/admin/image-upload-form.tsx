
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploadForm({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [productId, setProductId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    let uploadedPath: string | null = null;

    try {
      if (!productId) {
        throw new Error("Please select a product.");
      }

      if (!file) {
        throw new Error("Please select an image.");
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Only JPEG, PNG and WebP images are allowed.");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Image must be smaller than 5 MB.");
      }

      const extension = file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
        ? "png"
        : "webp";

      const storagePath =
        `${productId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedPath = storagePath;

      const { error: databaseError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          storage_path: storagePath,
          alt_text: altText.trim(),
          sort_order: 0,
        });

      if (databaseError) throw databaseError;

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage
          .from("product-images")
          .remove([uploadedPath]);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Image upload failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-fuchsia-700">
          Upload Product Image
        </h1>

        <p className="mt-2 text-gray-600">
          Add a photo to one of your clothing products.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="product" className="mb-2 block font-medium">
              Product
            </label>
            <select
              id="product"
              required
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="w-full rounded-xl border p-3"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="image" className="mb-2 block font-medium">
              Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="alt" className="mb-2 block font-medium">
              Image Description
            </label>
            <input
              id="alt"
              maxLength={200}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Pink silk saree with gold embroidery"
              className="w-full rounded-xl border p-3"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-fuchsia-700 p-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>
    </main>
  );
}
