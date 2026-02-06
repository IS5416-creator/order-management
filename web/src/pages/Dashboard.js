import { useEffect, useState } from "react";
import { getOrders } from "../services/api";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      setTotalOrders(orders.length);

      const salesTotal = orders.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total) || 0;
        return sum + orderTotal;
      }, 0);

      setTotalSales(salesTotal);

      const uniqueCustomers = new Set();
      orders.forEach(order => {
        if (order.customerName) {
          uniqueCustomers.add(order.customerName);
        }
      });

      setTotalCustomers(uniqueCustomers.size);
    } else {
      setTotalOrders(0);
      setTotalSales(0);
      setTotalCustomers(0);
    }
  }, [orders]);

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

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}
      >
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minWidth: "200px",
            flex: 1
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#495057" }}>
            Total Orders
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#0d6efd"
            }}
          >
            {totalOrders}
          </p>
          <p
            style={{
              color: "#6c757d",
              margin: "5px 0 0 0",
              fontSize: "0.9rem"
            }}
          >
            All time orders
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minWidth: "200px",
            flex: 1
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#495057" }}>
            Total Sales
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#198754"
            }}
          >
            {totalSales.toFixed(2)} ETB
          </p>
          <p
            style={{
              color: "#6c757d",
              margin: "5px 0 0 0",
              fontSize: "0.9rem"
            }}
          >
            Gross revenue
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minWidth: "200px",
            flex: 1
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#495057" }}>
            Customers
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              color: "#fd7e14"
            }}
          >
            {totalCustomers}
          </p>
          <p
            style={{
              color: "#6c757d",
              margin: "5px 0 0 0",
              fontSize: "0.9rem"
            }}
          >
            Unique customers
          </p>
        </div>
      </div>

      {totalOrders > 0 && totalCustomers > 0 && (
        <div
          style={{
            backgroundColor: "#e8f4fd",
            padding: "15px",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 5px 0",
                fontWeight: "bold",
                color: "#0a58ca"
              }}
            >
              Business Insights
            </p>
            <p style={{ margin: 0, color: "#495057", fontSize: "0.95rem" }}>
              <strong>Average Order Value:</strong>{" "}
              {(totalSales / totalOrders).toFixed(2)} ETB •
              <strong style={{ marginLeft: "15px" }}>
                Orders per Customer:
              </strong>{" "}
              {(totalOrders / totalCustomers).toFixed(1)}
            </p>
          </div>
        </div>
      )}

      <h3>Recent Orders</h3>
      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        width="100%"
        style={{ marginTop: "10px" }}
      >
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

          {orders.map(order => (
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
                        : "#004085"
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
