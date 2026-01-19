function StatusBadge({ status }) {
  const getStatusStyle = () => {
    switch(status) {
      case 'Completed':
        return {
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case 'Pending':
        return {
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7'
        };
      case 'Cancelled':
        return {
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      default:
        return {
          backgroundColor: '#e2e3e5',
          color: '#383d41',
          border: '1px solid #d6d8db'
        };
    }
  };

  const style = getStatusStyle();

  return (
    <span 
      className="status-badge"
      style={style}
    >
      {status}
    </span>
  );
}

export default StatusBadge;