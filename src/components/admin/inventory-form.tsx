
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
};

export default function InventoryForm({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [productId, setProductId] = useState("");
  const [sku, setSku] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const quantity = Number(stock);

      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error("Stock must be a non-negative whole number.");
      }

      const { error } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          sku: sku.trim().toUpperCase(),
          size: size.trim(),
          color: color.trim(),
          stock_quantity: quantity,
          is_active: true,
        });

      if (error) throw error;

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save inventory"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-fuchsia-700">
          Add Inventory
        </h1>

        <p className="mt-2 text-gray-600">
          Add sizes, colors, and stock quantities for your products.
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
            <label htmlFor="sku" className="mb-2 block font-medium">
              SKU
            </label>
            <input
              id="sku"
              required
              maxLength={60}
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="RPS-PNK-FS"
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="size" className="mb-2 block font-medium">
              Size
            </label>
            <input
              id="size"
              required
              maxLength={50}
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="Free Size"
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="color" className="mb-2 block font-medium">
              Color
            </label>
            <input
              id="color"
              required
              maxLength={50}
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="Pink"
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label htmlFor="stock" className="mb-2 block font-medium">
              Stock Quantity
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              required
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="12"
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
            {loading ? "Saving..." : "Save Inventory"}
          </button>
        </form>
      </div>
    </main>
  );
}
