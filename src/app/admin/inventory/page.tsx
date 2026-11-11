
import { requireAdmin } from "@/lib/auth/admin";
import InventoryForm from "@/components/admin/inventory-form";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { supabase } = await requireAdmin();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name");

  if (error) {
    return (
      <main className="p-8 text-red-600">
        Unable to load products: {error.message}
      </main>
    );
  }

  return <InventoryForm products={products ?? []} />;
}
