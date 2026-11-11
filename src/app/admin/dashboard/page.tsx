import Link from "next/link";
import LogoutButton from "@/app/components/logout-button";
import { requireAdmin } from "@/lib/auth/admin";
import ProductStatusButton from "@/components/admin/product-status-button";
export const dynamic = "force-dynamic";


type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  categories: {
    name: string;
  }[];
};


export default async function AdminDashboard() {
  const { user, supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      currency,
      status,
      created_at,
      categories (
        name
      )
    `)
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-fuchsia-700">
              YOUR BRAND
            </h1>
            <p className="mt-1 text-gray-600">
              Administrator Dashboard
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8">
          
<div className="flex flex-wrap items-center justify-between gap-4">
  <h2 className="text-2xl font-bold">
    Product Management
  </h2>

  <a
    href="/admin/products/new"
    className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold text-white"
  >
    + Add Product
  </a>

<a
  href="/admin/inventory"
  className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
>
  + Add Inventory
</a>

<a
  href="/admin/images"
  className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white"
>
  + Upload Image
</a>

<a
  href="/admin/inventory/manage"
  className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold text-white"
>
  Manage Inventory
</a>



</div>


          <p className="mt-2 text-gray-600">
            Signed in as {user.email}
          </p>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              Products in Supabase: {products.length}
            </h3>

            {error ? (
              <p className="mt-4 text-red-600">
                Unable to load products: {error.message}
              </p>
            ) : products.length === 0 ? (
              <p className="mt-4 text-gray-500">
                No products have been added yet.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-600">
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3 font-medium">
                          {product.name}
                        </td>

                        <td className="p-3">
                          
                          {Array.isArray(product.categories)
                            ? product.categories[0]?.name ?? "Unknown"
                            : (product.categories as { name: string } | null)?.name ?? "Unknown"}

                        </td>

                        <td className="p-3">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: product.currency,
                          }).format(product.price)}
                        </td>

                        <td className="p-3 capitalize">
                          {product.status}
                        </td>

<td className="p-3">
 
<div className="flex flex-wrap items-center gap-3">
  <Link
    href={`/admin/products/${product.id}/edit`}
    className="rounded-lg bg-fuchsia-700 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-800"
  >
    Edit
  </Link>
  <Link
  href="/admin/images/manage"
  className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold text-white"
>
  Manage Images
</Link>

  <ProductStatusButton
    productId={product.id}
    currentStatus={product.status}
  />
</div>

</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}