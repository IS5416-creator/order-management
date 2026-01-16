import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../Components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="container">
      <h2>Products</h2>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default Products;
