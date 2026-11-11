
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import SetMainImageButton from "@/components/admin/set-main-image-button";
import DeleteProductImageButton from "@/components/admin/delete-product-image-button";
import UploadProductImage from "@/components/admin/upload-product-image";
export const dynamic = "force-dynamic";

export default async function ManageImagesPage() {
  const { supabase } = await requireAdmin();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      status,
      product_images (
        id,
        storage_path,
        alt_text,
        sort_order
      )
    `)
    .order("name");

  if (error) {
    return (
      <main className="p-8 text-red-600">
        Unable to load product images: {error.message}
      </main>
    );
  }

  const productList = (products ?? []).map((product) => {
    const images = [...(product.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order);

    return {
      ...product,
      images: images.map((image) => ({
        ...image,
        url: supabase.storage
          .from("product-images")
          .getPublicUrl(image.storage_path).data.publicUrl,
      })),
    };
  });

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-fuchsia-700">
              Manage Product Images
            </h1>
            <p className="mt-2 text-gray-600">
              View images associated with your products.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-fuchsia-700 px-4 py-2 text-fuchsia-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {productList.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="space-y-6">
            {productList.map((product) => (
              <section
                key={product.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Status: {product.status}
                    </p>
                  </div>

                  <span className="text-sm text-gray-600">
                    {product.images.length} image(s)
                  </span>
                </div>

                {product.images.length === 0 ? (
                  <p className="text-gray-500">
                    No images uploaded yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {product.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-xl border"
                      >
                        <img
                          src={image.url}
                          alt={image.alt_text || product.name}
                          className="h-48 w-full object-cover"
                        />

                        <div className="p-3">
                          {index === 0 && (
                            <span className="text-xs font-semibold text-fuchsia-700">
                              Main Image
                            </span>
                          )}

                          <p className="mt-1 text-xs text-gray-500">
                            Sort order: {image.sort_order}
                          </p>
                          <SetMainImageButton
                            imageId={image.id}
                            productId={product.id}
                            isMain={index === 0}
                          />
                          <DeleteProductImageButton
                            imageId={image.id}
                            productId={product.id}
                            storagePath={image.storage_path}
                          />
                          <UploadProductImage
  productId={product.id}
  productName={product.name}
/>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
