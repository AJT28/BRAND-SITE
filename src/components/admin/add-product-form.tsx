
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
};

export default function AddProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const slug =
      name.toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      crypto.randomUUID().slice(0, 8);

    try {
      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        slug,
        category_id: categoryId,
        price: Number(price),
        description: description.trim(),
        currency: "USD",
        status: "draft",
      });

      if (error) throw error;

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create product"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-fuchsia-700">
          Add New Product
        </h1>

        <p className="mt-2 text-gray-600">
          Create a new clothing product for YOUR BRAND.
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
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Pink Silk Saree"
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
              onChange={(e) => setCategoryId(e.target.value)}
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
            <label htmlFor="price" className="mb-2 block font-medium">
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={3000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            {loading ? "Saving..." : "Save Product as Draft"}
          </button>
        </form>
      </div>
    </main>
  );
}
