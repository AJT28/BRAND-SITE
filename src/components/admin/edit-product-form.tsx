
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: number;
  currency: string;
  status: string;
};

type Category = {
  id: string;
  name: string;
};

type Props = {
  product: Product;
  categories: Category[];
};

export default function EditProductForm({
  product,
  categories,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const numericPrice = Number(price);

    if (!cleanName) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (
      !price.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setErrorMessage("Enter a valid price.");
      return;
    }

    if (!categories.some((category) => category.id === categoryId)) {
      setErrorMessage("Please select a valid category.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .update({
          name: cleanName,
          category_id: categoryId,
          description: cleanDescription,
          price: numericPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)
        .select("id")
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("Product could not be updated.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-fuchsia-700">
          Edit Product
        </h1>

        <p className="mt-2 text-gray-600">
          Update product information for your storefront.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block font-medium">
              Product Name
            </label>
            <input
              id="name"
              required
              maxLength={150}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block font-medium">
              Category
            </label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-xl border p-3"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              maxLength={3000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block font-medium">
              Price ({product.currency})
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <p className="text-sm text-gray-600">
            Current status:{" "}
            <span className="font-semibold capitalize">
              {product.status}
            </span>
          </p>

          {errorMessage && (
            <p role="alert" className="text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-fuchsia-700 p-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              disabled={loading}
              className="rounded-xl border border-pink-200 px-5 py-3 font-semibold text-fuchsia-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
