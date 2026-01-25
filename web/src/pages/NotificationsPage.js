import { useState, useEffect, useCallback } from "react";
import NotificationItem from "../Components/NotificationItem";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stats");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const getMockNotifications = () => {
    return [
      {
        id: "1",
        type: "new_order",
        title: "New Order Received",
        message: "Order #1001 from John Doe - 1,299.99 ETB",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        priority: "high",
        read: false,
        link: "/orders/1"
      },
      {
        id: "2",
        type: "order_update",
        title: "Order Status Updated",
        message: 'Order #1002 status changed to "Processing"',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        priority: "medium",
        read: true
      },
      {
        id: "3",
        type: "low_stock",
        title: "Low Stock Alert",
        message: 'Product "Wireless Mouse" is running low (5 units left)',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        priority: "high",
        read: false,
        link: "/products"
      },
      {
        id: "4",
        type: "system",
        title: "System Update",
        message: "Database connection established successfully",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        priority: "info",
        read: true
      }
    ];
  };

  const generateNotificationsFromOrders = useCallback((orders, statsData) => {
    const notifications = [];
    const recentOrders = orders.slice(0, 10);

    recentOrders.forEach(order => {
      if (order.status === "pending") {
        notifications.push({
          id: `order_${order._id}`,
          type: "new_order",
          title: "New Order Received",
          message: `Order #${order.orderNumber} from ${order.customerName} - ${order.total?.toFixed(2)} ETB`,
          timestamp: order.createdAt,
          priority: "high",
          read: false,
          link: `/orders/${order._id}`
        });
      }

      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.quantity > 10) {
            notifications.push({
              id: `bulk_${order._id}_${item.productId}`,
              type: "bulk_order",
              title: "Bulk Order Item",
              message: `${item.quantity} units of ${item.productName || "product"} ordered in Order #${order.orderNumber}`,
              timestamp: order.createdAt,
              priority: "medium",
              read: false
            });
          }
        });
      }
    });

    if (statsData) {
      if (statsData.totalOrders === 0) {
        notifications.push({
          id: "no_orders",
          type: "system",
          title: "Welcome!",
          message: "No orders yet. Create your first order to get started.",
          timestamp: new Date().toISOString(),
          priority: "info",
          read: false,
          link: "/create-order"
        });
      }

      if (statsData.totalRevenue > 10000) {
        notifications.push({
          id: "revenue_milestone",
          type: "achievement",
          title: "Revenue Milestone!",
          message: `Total revenue exceeded ${statsData.totalRevenue.toFixed(2)} ETB!`,
          timestamp: new Date().toISOString(),
          priority: "medium",
          read: false
        });
      }
    }

    return notifications.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/orders");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      const orders = result.data || [];
      const generatedNotifications = generateNotificationsFromOrders(orders, stats);
      setNotifications(generatedNotifications);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please check if backend is running.");
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  }, [generateNotificationsFromOrders, stats]);

  useEffect(() => {
    fetchNotifications();
    fetchSystemStats();
  }, [fetchNotifications]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading notifications from database...
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
        </div>
        <div className="error-message">
          <p style={{ color: "#dc3545", marginBottom: "10px" }}>{error}</p>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            Showing mock data for demonstration. Make sure your Express backend is running.
          </p>
        </div>
        <button onClick={fetchNotifications} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  marginLeft: "10px"
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary"
                style={{ padding: "8px 16px" }}
              >
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="btn-danger"
                style={{ padding: "8px 16px" }}
              >
                Clear All
              </button>
            )}
            <button onClick={fetchNotifications} className="refresh-btn">
              Refresh
            </button>
          </div>
        </div>

        <div style={{ marginTop: "10px", color: "#666", fontSize: "14px" }}>
          <p>
            Notifications are generated from your order data.
            {stats && (
              <>
                {" "}Total Orders: <strong>{stats.totalOrders || 0}</strong> |{" "}
                Revenue: <strong>{stats.totalRevenue?.toFixed(2) || "0.00"} ETB</strong>
              </>
            )}
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "48px", color: "#ccc", marginBottom: "20px" }}>🔔</div>
            <h3>No notifications yet</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              When you receive orders or have system updates, they will appear here.
            </p>
            <button
              onClick={() => (window.location.href = "/create-order")}
              className="btn-primary"
            >
              Create Your First Order
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
              fontSize: "14px",
              color: "#666"
            }}
          >
            <p>
              <strong>Note:</strong> These notifications are generated dynamically from your order data.
              New orders, status updates, and low stock alerts will appear here automatically.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationsPage;
