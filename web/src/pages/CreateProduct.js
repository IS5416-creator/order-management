import { useState } from "react";
import { createProduct } from "../services/api";

function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required' });
      return;
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      setMessage({ type: 'error', text: 'Price must be greater than 0' });
      return;
    }
    
    if (form.stock && parseInt(form.stock) < 0) {
      setMessage({ type: 'error', text: 'Stock cannot be negative' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const productData = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category.trim() || undefined,
        stock: form.stock ? parseInt(form.stock) : 0
      };

      const result = await createProduct(productData);
      
      if (result.success) {
        setMessage({ type: 'success', text: `Product "${form.name}" created successfully!` });
        setForm({ name: "", price: "", category: "", stock: "" });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create product' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check if backend is running.' });
      console.error('Create product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  return (
    <div className="container">
      <h2>Create Product</h2>

      {message.text && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Product Name *</label>
          <input
            name="name"
            placeholder=""
            value={form.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Price (ETB) *</label>
          <input
            name="price"
            type="number"
            placeholder=""
            value={form.price}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            min="0.01"
            step="0.01"
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
          <input
            name="category"
            placeholder=""
            value={form.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Initial Stock</label>
          <input
            name="stock"
            type="number"
            placeholder=""
            value={form.stock}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            min="0"
            disabled={loading}
          />
        </div>

        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>

        {loading && (
          <div style={{ marginTop: '10px', color: '#666' }}>Connecting to database...</div>
        )}
      </form>

      
    </div>
  );
}

export default CreateProduct;
