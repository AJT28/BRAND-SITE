
"use client";

import { useState } from "react";

type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

type Props = {
  images: ProductImage[];
  productName: string;
};

export default function ProductImageGallery({
  images,
  productName,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-pink-100 text-fuchsia-700">
        No image available
      </div>
    );
  }

  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-pink-50">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          className="aspect-square w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={`overflow-hidden rounded-xl border-2 ${
                selectedIndex === index
                  ? "border-fuchsia-700"
                  : "border-transparent"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} view ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
