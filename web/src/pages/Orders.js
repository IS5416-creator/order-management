import { useEffect, useState } from "react";
import { getProducts, createOrder } from "../services/api";

function Orders() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createOrder({
      productId: Number(productId),
      quantity: Number(quantity)
    });

    alert("Order created");
  };

  return (
    <div className="container">
      <h2>Create Order</h2>

      <form onSubmit={handleSubmit}>
        <select onChange={e => setProductId(e.target.value)}>
          <option>Select product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        <input
          placeholder="Quantity"
          type="number"
          onChange={e => setQuantity(e.target.value)}
        />

        <button>Create Order</button>
      </form>
    </div>
  );
}

export default Orders;
