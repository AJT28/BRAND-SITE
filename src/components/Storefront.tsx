

"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Menu,
  X,
  Search,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import type { StoreProduct } from "@/lib/products";

type StorefrontProps = {
  products: StoreProduct[];
};

const categories = [
  "All",
  "Sarees",
  "Kurta Sets",
  "Lehengas",
  "Anarkalis",
];

export default function Storefront({ products }: StorefrontProps) {
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
     category === "All" ||
product.category.trim().toLowerCase() ===
  category.trim().toLowerCase();

      const matchesSearch =
        `${product.name} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  function inquire(product: StoreProduct) {
    if (!whatsapp) {
      alert(
        "WhatsApp contact is not configured. Add NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local."
      );
      return;
    }

    const message =
      `Hello! I am interested in ${product.name}. ` +
      `Is it available? Product ID: ${product.id}`;

    const cleanNumber = whatsapp.replace(/\D/g, "");

    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function formatPrice(product: StoreProduct) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currency || "USD",
    }).format(product.price);
  }

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-[#fffaf3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a
            href="#home"
            className="text-xl font-black tracking-tight text-fuchsia-700"
          >
            YOUR <span className="text-orange-500">BRAND</span>
            <span className="ml-1 text-sm">✦</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#home" className="hover:text-fuchsia-700">
              Home
            </a>
            <a href="#shop" className="hover:text-fuchsia-700">
              Shop
            </a>
            <a href="#about" className="hover:text-fuchsia-700">
              Our Story
            </a>
            <a href="#contact" className="hover:text-fuchsia-700">
              Contact
            </a>
          </nav>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle menu"
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>

        {menu && (
          <nav className="flex flex-col gap-4 border-t bg-white px-5 py-5 text-sm font-semibold md:hidden">
            {[
              ["Home", "#home"],
              ["Shop", "#shop"],
              ["Our Story", "#about"],
              ["Contact", "#contact"],
            ].map(([name, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
              >
                {name}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-br from-[#ffdaea] via-[#fff0cb] to-[#ffc8a9]"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-fuchsia-800">
                <Sparkles size={16} />
                Colorful traditions, modern spirit
              </span>

              <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-[#572146] md:text-7xl">
                Wear your{" "}
                <span className="text-fuchsia-600">colors.</span>
                <br />
                Celebrate your{" "}
                <span className="text-orange-600">story.</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6e4859]">
                Discover expressive ethnic wear for everyday elegance,
                special moments, and everything in between.
              </p>

              <a
                href="#shop"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-fuchsia-700 px-7 py-4 font-bold text-white shadow-lg shadow-fuchsia-300 transition hover:bg-fuchsia-800"
              >
                Explore Collection
                <ArrowRight size={19} />
              </a>
            </div>

            <div className="relative flex min-h-[340px] items-center justify-center rounded-[3rem] bg-gradient-to-tr from-fuchsia-600 via-pink-500 to-orange-400 shadow-2xl md:min-h-[490px]">
              <div className="absolute left-7 top-7 rounded-full bg-white/25 px-5 py-2 text-sm font-bold text-white">
                ETHNIC EDIT ✦
              </div>

              <div className="text-center">
                <div className="text-[130px] leading-none drop-shadow-2xl md:text-[190px]">
                  🥻
                </div>
                <p className="mt-5 text-2xl font-black tracking-widest text-white">
                  THE FESTIVE EDIT
                </p>
                <p className="mt-2 text-sm text-white/90">
                  Your style. Your celebration.
                </p>
              </div>

              <div className="absolute bottom-6 right-6 rounded-full bg-yellow-300 px-5 py-3 font-black text-fuchsia-900">
                NEW ✨
              </div>
            </div>
          </div>
        </section>

        <section className="bg-fuchsia-800 py-4 text-center text-sm font-bold tracking-wider text-white">
          ✦ COLORFUL COLLECTIONS &nbsp; ✦ TIMELESS TRADITIONS
          &nbsp; ✦ MADE TO EXPRESS YOU ✦
        </section>

        {/* SHOP SECTION */}
        <section
          id="shop"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-bold uppercase tracking-[.2em] text-orange-600">
                The collection
              </p>

              <h2 className="mt-2 text-4xl font-black text-[#572146] md:text-5xl">
                Find your favorite look
              </h2>

              <p className="mt-3 text-[#846676]">
                Explore our latest collection of ethnic wear.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-3">
              <Search size={18} className="text-fuchsia-600" />
              <input
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search styles..."
                className="w-full bg-transparent text-sm outline-none md:w-52"
              />
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="mb-9 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  category === item
                    ? "bg-fuchsia-700 text-white"
                    : "border border-pink-200 bg-white text-fuchsia-800 hover:bg-pink-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* REAL SUPABASE PRODUCTS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* PRODUCT IMAGE */}
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-pink-200 to-rose-300">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-8xl"
                      role="img"
                      aria-label="Product image unavailable"
                    >
                      🥻
                    </span>
                  )}
                </div>

                {/* PRODUCT DETAILS */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-600">
                      {product.category}
                    </span>

                    <span className="font-black text-[#572146]">
                      {formatPrice(product)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-black">
                    {product.name}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-relaxed text-[#846676]">
                    {product.description}
                  </p>

<Link
  href={`/products/${product.id}`}
  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-fuchsia-700 px-4 py-3 font-bold text-white transition hover:bg-fuchsia-800"
>
  View Details
  <ArrowRight size={18} />
</Link>

                  <button
                    type="button"
                    onClick={() => inquire(product)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#fce7f3] px-4 py-3 font-bold text-fuchsia-800 hover:bg-fuchsia-200"
                  >
                    <MessageCircle size={18} />
                    Ask on WhatsApp
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="rounded-2xl bg-white p-10 text-center text-[#846676]">
              {products.length === 0
                ? "Our collection is coming soon. Check back later!"
                : "No styles match your search. Try another category or keyword."}
            </p>
          )}
        </section>

        {/* ABOUT SECTION */}
        <section
          id="about"
          className="scroll-mt-24 bg-[#fff0e3] px-5 py-20"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-bold uppercase tracking-widest text-orange-600">
              Our story
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#572146]">
              Tradition, with a splash of joy.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#76546a]">
              YOUR BRAND is a space for vibrant ethnic styles and
              individual expression.
            </p>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section
          id="contact"
          className="mx-auto max-w-4xl scroll-mt-24 px-5 py-20 text-center"
        >
          <p className="font-bold uppercase tracking-widest text-orange-600">
            Let&apos;s connect
          </p>

          <h2 className="mt-3 text-4xl font-black text-[#572146]">
            Have a question about a style?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#846676]">
            Use the WhatsApp button on any product to ask about
            availability, sizes, or colors.
          </p>

          <a
            href="#shop"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-fuchsia-700 px-7 py-3 font-bold text-white hover:bg-fuchsia-800"
          >
            Browse Products
            <ArrowRight size={18} />
          </a>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#48213d] px-5 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-black">YOUR BRAND ✦</p>
            <p className="mt-1 text-sm text-pink-200">
              Colorful ethnic wear, your way.
            </p>
          </div>

          <div className="flex gap-5 text-sm">
            <a href="#shop">Shop</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <p className="text-sm text-pink-200">
            © {new Date().getFullYear()} YOUR BRAND
          </p>
        </div>
      </footer>
    </>
  );
}
