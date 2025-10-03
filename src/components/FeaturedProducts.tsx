"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeaturedNav from "./FeaturedNav";

type AllProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  categories: string[];
  image: string[];
  rating: number;
  shop_category: string;
};

export default function FeaturedProducts({ featured }: { featured?: string }) {
  const [products, setProducts] = useState<AllProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchProducts = async () => {
      try {
        const category = featured || "gadgets";
        const response = await fetch(`/api/products/featured?category=${category}`);
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [featured, mounted]);

  if (!mounted) {
    return (
      <section className="featured-products py-10 w-full">
        <div className="container">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-5">
            Best sellers in gadgets products
          </h1>
          <FeaturedNav />
          <div className="grid gap-4 grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products py-10 w-full">
      <div className="container">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-5">
          Best sellers in{" "}
          <Link href={`/shops/${featured || "gadgets"}`} className="text-primary hover:underline">
            {featured || "gadgets"}
          </Link>{" "}
          products
        </h1>
        <FeaturedNav />
        
        <div className="grid gap-4 grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded"></div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="border p-4 rounded bg-white shadow hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Image</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                <p className="text-primary font-bold text-lg">${product.price}</p>
                <p className="text-xs text-gray-500 capitalize">{product.shop_category}</p>
                <button className="w-full mt-2 bg-primary text-white py-1 px-2 rounded text-xs hover:bg-primary/90">
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No products found in this category</p>
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-center w-full">
          <Link
            href={`/shops/${featured || "gadgets"}`}
            className="py-3 px-6 rounded-lg bg-primary text-white uppercase font-medium hover:bg-primary/90 transition-colors"
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
}
