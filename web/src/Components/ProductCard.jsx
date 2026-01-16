function ProductCard({ product }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>

      {product.stock < 5 && (
        <p className="low-stock">LOW STOCK</p>
      )}
    </div>
  );
}

export default ProductCard;
