import { useState, useEffect } from "react";
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from "../services/api";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await getCustomers();
      setCustomers(customersData);
      setError(null);
    } catch (err) {
      setError("Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        // Update existing customer
        const result = await updateCustomer(editingCustomer._id || editingCustomer.id, formData);
        if (result.success) {
          // Update the customer in the list
          setCustomers(customers.map(customer => 
            (customer._id === editingCustomer._id || customer.id === editingCustomer.id) 
              ? { ...customer, ...formData }
              : customer
          ));
          alert("Customer updated successfully!");
        } else {
          alert(result.message || "Failed to update customer");
        }
      } else {
        // Create new customer
        const result = await createCustomer(formData);
        if (result.success) {
          // Add the new customer to the list
          fetchCustomers(); // Refresh the list
          alert("Customer created successfully!");
        } else {
          alert(result.message || "Failed to create customer");
        }
      }
      
      // Reset form
      resetForm();
    } catch (err) {
      alert("An error occurred. Please try again.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: ""
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const result = await deleteCustomer(id);
      if (result.success) {
        // Remove customer from the list
        setCustomers(customers.filter(customer => 
          (customer._id !== id && customer.id !== id)
        ));
        alert("Customer deleted successfully!");
      } else {
        alert(result.message || "Failed to delete customer");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h2>Customers</h2>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Customers</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          {error}
          <button 
            onClick={fetchCustomers}
            style={{
              marginLeft: "10px",
              backgroundColor: "transparent",
              color: "#721c24",
              border: "1px solid #721c24",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Customer Form */}
      {showForm && (
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="name" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "16px"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "16px"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="phone" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "16px"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="address" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "16px",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: editingCustomer ? "#198754" : "#0d6efd",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                {editingCustomer ? "Update Customer" : "Create Customer"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Table */}
      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="10" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ marginBottom: "10px" }}>No customers found</p>
                  <button 
                    onClick={() => setShowForm(true)}
                    style={{
                      backgroundColor: "#0d6efd",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Add Your First Customer
                  </button>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id || customer.id}>
                  <td style={{ fontWeight: "500" }}>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "N/A"}</td>
                  <td>{customer.address || "N/A"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEdit(customer)}
                        style={{
                          backgroundColor: "#ffc107",
                          color: "#212529",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id || customer.id)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {customers.length > 0 && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          display: "inline-block"
        }}>
          <p style={{ margin: 0, color: "#495057" }}>
            Total Customers: <strong>{customers.length}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;