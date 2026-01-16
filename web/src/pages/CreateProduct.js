import { useState } from "react";
import { createProduct } from "../services/api";

function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price < 0 || form.stock < 0) {
      alert("Invalid input");
      return;
    }

    await createProduct(form);
    alert("Product created");
  };

  return (
    <div className="container">
      <h2>Create Product</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Product Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        <input
          placeholder="Stock"
          type="number"
          onChange={e => setForm({ ...form, stock: e.target.value })}
        />
        <button>Create</button>
      </form>
    </div>
  );
}

export default CreateProduct;
