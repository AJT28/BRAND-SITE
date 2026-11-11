
import Storefront from "@/components/Storefront";
import { getPublishedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getPublishedProducts();

  return <Storefront products={products} />;
}
