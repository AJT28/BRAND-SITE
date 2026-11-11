
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductImageGallery from "@/components/product-image-gallery";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      currency,
      status,
      categories (name),
      product_images (
      id,
        storage_path,
        alt_text,
        sort_order
      ),
      product_variants (
        size,
        color,
        stock_quantity,
        is_active
      )
    `)
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !product) {
    notFound();
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const variants = (product.product_variants ?? []).filter(
    (variant) => variant.is_active
  );

  const category = product.categories?.[0]?.name ?? "Ethnic Wear";

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
  }).format(Number(product.price));

  const whatsappNumber = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
  ).replace(/\D/g, "");

  const message = encodeURIComponent(
    `Hello! I am interested in ${product.name}. ` +
    `Could you tell me more about its availability?`
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${message}`
    : null;

  return (
    <main className="min-h-screen bg-[#fffaf3] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/#shop"
          className="font-semibold text-fuchsia-700 hover:underline"
        >
          ← Back to Collection
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* PRODUCT IMAGES */}
          <div className="space-y-4">
            {images.length > 0 ? (
              images.map((image) => {
                const imageUrl = supabase.storage
                  .from("product-images")
                  .getPublicUrl(image.storage_path)
                  .data.publicUrl;

                return (
                  <div
                    key={image.storage_path}
                    className="overflow-hidden rounded-3xl bg-pink-100"
                  >
                    
<ProductImageGallery
  productName={product.name}
  images={images.map((image) => ({
    id: image.id,
    url: supabase.storage
      .from("product-images")
      .getPublicUrl(image.storage_path).data.publicUrl,
    alt: image.alt_text || product.name,
  }))}
/>

                  </div>
                );
              })
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-3xl bg-pink-100 text-8xl">
                🥻
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              {category}
            </p>

            <h1 className="mt-3 text-4xl font-black text-[#572146]">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-bold text-fuchsia-700">
              {price}
            </p>

            <p className="mt-6 leading-relaxed text-[#76546a]">
              {product.description}
            </p>

            {/* AVAILABLE VARIANTS */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#572146]">
                Available Options
              </h2>

              {variants.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={`${variant.size}-${variant.color}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-pink-200 bg-white p-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {variant.size}
                        </p>
                        <p className="text-sm text-gray-600">
                          {variant.color}
                        </p>
                      </div>

                      <span
                        className={`text-sm font-bold ${
                          variant.stock_quantity > 0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {variant.stock_quantity > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-gray-600">
                  Available options will be updated soon.
                </p>
              )}
            </div>

            {/* WHATSAPP */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-fuchsia-700 px-6 py-4 font-bold text-white hover:bg-fuchsia-800"
              >
                Ask About This Product on WhatsApp
              </a>
            ) : (
              <p className="mt-8 text-sm text-gray-600">
                WhatsApp inquiries are not configured yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
