import { useEffect, useState } from "react";
import {
  getProducts,
  getOrders,
  getNotifications
} from "../services/api";

import SummaryCard from "../Components/SummaryCard";
import NotificationItem from "../Components/NotificationItem";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
    getOrders().then(setOrders);
    getNotifications().then(setNotifications);
  }, []);

  const lowStockCount = products.filter(p => p.stock < 5).length;

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div className="cards">
        <SummaryCard title="Total Products" value={products.length} />
        <SummaryCard title="Low Stock" value={lowStockCount} />
        <SummaryCard title="Total Orders" value={orders.length} />
      </div>

      <h3>Notifications</h3>
      {notifications.map(n => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

export default Dashboard;
