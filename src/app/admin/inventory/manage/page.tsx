
import { requireAdmin } from "@/lib/auth/admin";
import ManageInventoryForm from "@/components/admin/manage-inventory-form";

export const dynamic = "force-dynamic";

export default async function ManageInventoryPage() {
  const { supabase } = await requireAdmin();

  const { data: variants, error } = await supabase
    .from("product_variants")
    .select(`
      id,
      sku,
      size,
      color,
      stock_quantity,
      is_active,
      products (
        name
      )
    `)
    .order("sku");

  if (error) {
    return (
      <main className="p-8 text-red-600">
        Unable to load inventory: {error.message}
      </main>
    );
  }

  return <ManageInventoryForm variants={variants ?? []} />;
}
