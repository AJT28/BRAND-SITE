
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import EditProductForm from "@/components/admin/edit-product-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      "id, name, category_id, description, price, currency, status"
    )
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (categoriesError) {
    throw new Error("Unable to load categories.");
  }

  return (
    <EditProductForm
      product={{
        ...product,
        price: Number(product.price),
      }}
      categories={categories ?? []}
    />
  );
}
