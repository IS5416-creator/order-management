function NotificationItem({ notification }) {

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); 
  };

  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-message">{notification.message}</div>
      <div className="notification-time">{formatTime(notification.time)}</div>
    </div>
  );
}

export default NotificationItem;