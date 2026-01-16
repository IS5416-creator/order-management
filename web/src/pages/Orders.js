import { useEffect, useState } from "react";
import { getProducts, createOrder } from "../services/api";

const Orders = () => {
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([
    { productId: "", quantity: 1 }
  ]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch products
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  // Calculate total price
  useEffect(() => {
    let total = 0;

    items.forEach((item) => {
      const product = products.find(
        (p) => p.id === Number(item.productId)
      );
      if (product) {
        total += product.price * item.quantity;
      }
    });

    setTotalPrice(total);
  }, [items, products]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addProductRow = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const removeProductRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName) return;

    const formattedItems = items
      .filter((item) => item.productId)
      .map((item) => {
        const product = products.find(
          (p) => p.id === Number(item.productId)
        );

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: Number(item.quantity),
        };
      });

    if (formattedItems.length === 0) return;

    await createOrder({
      customerName,
      items: formattedItems,
    });

    // Reset form
    setCustomerName("");
    setItems([{ productId: "", quantity: 1 }]);
    setTotalPrice(0);

    alert("Order created successfully");
  };

  return (
    <div className="page">
      <h2>Create Order</h2>

      <form onSubmit={handleSubmit}>
        {/* Customer Name */}
        <div>
          <label>Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        {/* Products */}
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <select
              value={item.productId}
              onChange={(e) =>
                handleItemChange(index, "productId", e.target.value)
              }
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (${product.price})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
            />

            {items.length > 1 && (
              <button type="button" onClick={() => removeProductRow(index)}>
                ✕
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addProductRow} style={{ marginTop: "10px" }}>
          + Add Product
        </button>

        {/* Total */}
        <h3 style={{ marginTop: "20px" }}>
          Total Price: ${totalPrice.toFixed(2)}
        </h3>

        <button type="submit" style={{ marginTop: "10px" }}>
          Create Order
        </button>
      </form>
    </div>
  );
};

export default Orders;
