function NotificationItem({ notification }) {
  return (
    <div className={`notification ${notification.type}`}>
      {notification.message}
    </div>
  );
}

export default NotificationItem;
