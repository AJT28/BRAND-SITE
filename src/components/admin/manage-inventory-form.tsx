
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Variant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
  is_active: boolean;
  products: {
    name: string;
  }[];
};

export default function ManageInventoryForm({
  variants,
}: {
  variants: Variant[];
}) {
  const router = useRouter();

  const [stockValues, setStockValues] = useState<
    Record<string, string>
  >(
    Object.fromEntries(
      variants.map((variant) => [
        variant.id,
        String(variant.stock_quantity),
      ])
    )
  );

  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeValues, setActiveValues] = useState<
  Record<string, boolean>
>(
  Object.fromEntries(
    variants.map((variant) => [variant.id, variant.is_active])
  )
);

  async function updateStock(variantId: string) {
    const rawValue = stockValues[variantId];
    const quantity = Number(rawValue);

    if (
      rawValue === undefined ||
      rawValue.trim() === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    ) {
      setMessage("Please enter a valid non-negative whole number.");
      return;
    }

    setSavingId(variantId);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("product_variants")
        .update({ stock_quantity: quantity })
        .eq("id", variantId)
        .select("id, stock_quantity")
        .single();

      if (error) throw error;

      if (!data || data.stock_quantity !== quantity) {
        throw new Error("Stock was not updated.");
      }

      setMessage("Stock updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update stock."
      );
    } finally {
      setSavingId(null);
    }
  }

async function updateVariantStatus(variantId: string) {
  const currentValue = activeValues[variantId];
  const nextValue = !currentValue;

  setSavingId(variantId);
  setMessage("");

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .update({ is_active: nextValue })
      .eq("id", variantId)
      .select("id, is_active")
      .single();

    if (error) throw error;

    if (!data || data.is_active !== nextValue) {
      throw new Error("Variant status was not updated.");
    }

    setActiveValues((previous) => ({
      ...previous,
      [variantId]: nextValue,
    }));

    setMessage(
      nextValue
        ? "Variant enabled successfully."
        : "Variant disabled successfully."
    );

    router.refresh();
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Unable to update variant status."
    );
  } finally {
    setSavingId(null);
  }
}


  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-fuchsia-700">
          Manage Inventory
        </h1>

        <p className="mt-2 text-gray-600">
          View and update stock quantities for your products.
        </p>

        {message && (
          <p role="status" className="mt-4 text-sm text-fuchsia-700">
            {message}
          </p>
        )}

        {variants.length === 0 ? (
          <p className="mt-8 text-gray-600">
            No inventory variants have been added yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-pink-50">
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Color</th>
                  <th className="p-3">Stock</th>
<th className="p-3">Status</th>
<th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b">
                    <td className="p-3 font-medium">
                      {Array.isArray(variant.products)
  ? variant.products[0]?.name ?? "Unknown"
  : (variant.products as { name: string } | null)?.name ?? "Unknown"}
                    </td>

                    <td className="p-3">{variant.sku}</td>
                    <td className="p-3">{variant.size}</td>
                    <td className="p-3">{variant.color}</td>

                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        aria-label={`Stock for ${variant.sku}`}
                        value={stockValues[variant.id] ?? ""}
                        onChange={(event) =>
                          setStockValues((previous) => ({
                            ...previous,
                            [variant.id]: event.target.value,
                          }))
                        }
                        className="w-24 rounded-lg border p-2"
                      />
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => updateStock(variant.id)}
                        className="rounded-lg bg-fuchsia-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                      >
                        {savingId === variant.id
                          ? "Saving..."
                          : "Save"}
                      </button>
                    </td>

<td className="p-3">
  <button
    type="button"
    disabled={savingId !== null}
    onClick={() => updateVariantStatus(variant.id)}
    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
      activeValues[variant.id]
        ? "bg-orange-600 hover:bg-orange-700"
        : "bg-green-700 hover:bg-green-800"
    }`}
  >
    {savingId === variant.id
      ? "Updating..."
      : activeValues[variant.id]
      ? "Disable"
      : "Enable"}
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
