"use client";

import { useState } from "react";

type PortfolioItem = {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
};

type Props = {
  items: PortfolioItem[];
};

export default function PortfolioGallery({ items }: Props) {
  const [selectedItem, setSelectedItem] =
    useState<PortfolioItem | null>(null);

  return (
    <>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item)}
            className="overflow-hidden rounded-xl border bg-white text-left shadow transition hover:shadow-lg"
          >
            <img
              src={item.image_url}
              alt={item.title || "Trabajo realizado"}
              className="h-64 w-full object-cover"
            />

            {(item.title || item.description) && (
              <div className="p-5">
                {item.title && (
                  <h3 className="text-xl font-bold">
                    {item.title}
                  </h3>
                )}

                {item.description && (
                  <p className="mt-2 text-gray-600">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded bg-gray-800 px-4 py-2 text-white"
              >
                Cerrar
              </button>
            </div>

            <img
              src={selectedItem.image_url}
              alt={selectedItem.title || "Trabajo realizado"}
              className="mt-4 max-h-[70vh] w-full object-contain"
            />

            {selectedItem.title && (
              <h2 className="mt-5 text-2xl font-bold">
                {selectedItem.title}
              </h2>
            )}

            {selectedItem.description && (
              <p className="mt-2 text-gray-600">
                {selectedItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}