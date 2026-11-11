
import { createClient } from "@/lib/supabase/server";

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string | null;
};

export async function getPublishedProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      currency,
      description,
      categories (name),
      product_images (
        storage_path,
        sort_order
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load storefront products:", error.message);
    return [];
  }

  return (data ?? []).map((product) => {
    console.log("Storefront products from Supabase:", data);
    const categoryData = product.categories;

const category = Array.isArray(categoryData)
  ? categoryData[0]?.name ?? "Unknown"
  : (categoryData as { name: string } | null)?.name ?? "Unknown";
    const images = [...(product.product_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );

    const storagePath = images[0]?.storage_path;

    const imageUrl = storagePath
      ? supabase.storage
          .from("product-images")
          .getPublicUrl(storagePath).data.publicUrl
      : null;

    return {
      id: product.id,
      name: product.name,
      category,
      price: Number(product.price),
      currency: product.currency,
      description: product.description,
      imageUrl,
    };
  });
}
