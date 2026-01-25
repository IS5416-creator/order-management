import { useEffect, useState } from "react";
import { getOrders } from "../services/api";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h2>Dashboard</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h2>Dashboard</h2>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer Name</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No orders yet
              </td>
            </tr>
          )}

          {orders.map((order) => (
            <tr key={order._id || order.id}>
              <td>#{order.orderNumber}</td>
              <td>{order.customerName}</td>
              <td>{order.total?.toFixed(2)} ETB</td>
              <td>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      order.status === "completed"
                        ? "#d4edda"
                        : order.status === "processing"
                        ? "#fff3cd"
                        : order.status === "cancelled"
                        ? "#f8d7da"
                        : "#cce5ff",
                    color:
                      order.status === "completed"
                        ? "#155724"
                        : order.status === "processing"
                        ? "#856404"
                        : order.status === "cancelled"
                        ? "#721c24"
                        : "#004085",
                  }}
                >
                  {order.status?.charAt(0).toUpperCase() +
                    order.status?.slice(1)}
                </span>
              </td>
              <td>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
