"use client";

import { useEffect, useState } from "react";

export default function TestProducts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/featured?category=gadgets')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading test...</div>;
  
  return (
    <div>
      <h2>Test Products</h2>
      <p>Products found: {data?.data?.length || 0}</p>
      {data?.data?.slice(0, 3).map((product: any) => (
        <div key={product._id}>
          <h3>{product.title}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
