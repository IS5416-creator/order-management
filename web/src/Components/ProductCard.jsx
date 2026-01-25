function ProductCard({ product, onDelete }) {
  const { name, price, stock, category } = product;
  
  const stockStatus = stock <= 0 ? "out" : stock < 5 ? "low" : "normal";
  
  return (
    <div className={`product-card ${stockStatus}`}>
      <h3>{name}</h3>
      {category && <span className="category">{category}</span>}
      <p><strong>Price:</strong> {parseFloat(price || 0).toFixed(2)} ETB</p>
      <p><strong>Stock:</strong> {stock} units</p>
      {onDelete && (
        <button onClick={() => onDelete(product.id, product.name)}>
          Delete
        </button>
      )}
    </div>
  );
}
export default ProductCard;
