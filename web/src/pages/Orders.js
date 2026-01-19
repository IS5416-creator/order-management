import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../services/api";
import StatusBadge from "../Components/StatusBadge";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      // Ensure all orders have a total field
      const safeOrders = data.map(order => ({
        ...order,
        total: order.total || 0
      }));
      setOrders(safeOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`Order #${orderId} status updated to ${newStatus}`);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Safe total display function
  const displayTotal = (order) => {
    const total = order.total || 0;
    return `$${total.toFixed(2)}`;
  };

  return (
    <div className="container">
      <h2>Orders</h2>
      
      <div className="page-actions">
        <a href="/create-order" className="btn btn-primary">
          + Create New Order
        </a>
      </div>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet. Create your first order to get started.</p>
          <a href="/create-order" className="btn">Create Order</a>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customerName || "Anonymous"}</td>
                  <td>{displayTotal(order)}</td>
                  <td>
                    <StatusBadge status={order.status || "Pending"} />
                  </td>
                  <td>{formatDate(order.date)}</td>
                  <td>
                    <select 
                      value={order.status || "Pending"}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;