import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../services/api";
import StatusBadge from "../Components/StatusBadge";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      
      // Transform MongoDB _id to id for React compatibility
      const transformedOrders = (ordersData || []).map(order => ({
        ...order,
        id: order._id || order.id, // Ensure we have an id field
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log("Updating order:", orderId, "to:", newStatus);
      
      // Send the MongoDB _id to API
      await updateOrderStatus(orderId, newStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          // Compare both id and _id to be safe
          const isTargetOrder = order.id === orderId || order._id === orderId;
          return isTargetOrder 
            ? { ...order, status: newStatus } 
            : order;
        })
      );
      
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="container">
      <h2>Orders</h2>
      <a href="/create-order" className="btn btn-primary">
        + Create New Order
      </a>
      
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              // Debug: log each order's ID
              console.log("Rendering order:", {
                id: order.id,
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status
              });
              
              return (
                <tr key={order.id || order._id}>
                  <td>#{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{(order.total || 0).toFixed(2)} ETB</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <select 
                      key={`status-${order.id || order._id}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id || order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Orders;