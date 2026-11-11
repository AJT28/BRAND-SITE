
import { requireAdmin } from "@/lib/auth/admin";
import AddProductForm from "@/components/admin/add-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-600">
          Could not load categories: {error.message}
        </p>
      </main>
    );
  }

  return (
    <AddProductForm categories={categories ?? []} />
  );
}
