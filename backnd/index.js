const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = 'your-super-secret-jwt-key-here'; // Change this in production
const uri = "mongodb+srv://israel:israel@cluster0.yyptkvj.mongodb.net/order_management?appName=Cluster0";
const DB_NAME = 'order_management';

let db;

async function connectToDB() {
    try {
        const client = await MongoClient.connect(uri);
        db = client.db(DB_NAME);
        console.log('✅ Connected to MongoDB');
        
        const collections = await db.listCollections().toArray();
        const names = collections.map(c => c.name);

        if (!names.includes("orders")) await db.createCollection("orders");
        if (!names.includes("products")) await db.createCollection("products");
        if (!names.includes("customers")) await db.createCollection("customers");
        if (!names.includes("users")) await db.createCollection("users");
        if (!names.includes("notifications")) await db.createCollection("notification");

        await initializeSampleData();
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function initializeSampleData() {
    // Check and create admin user if doesn't exist
    const adminExists = await db.collection('users').findOne({ email: 'admin@example.com' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.collection('users').insertOne({
            name: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            createdAt: new Date()
        });
        console.log('👑 Created admin user');
    }

    const productsCount = await db.collection('products').countDocuments();
    if (productsCount === 0) {
        await db.collection('products').insertMany([
            { name: 'Laptop', price: 999.99, category: 'Electronics', stock: 50 },
            { name: 'Mouse', price: 29.99, category: 'Electronics', stock: 200 },
            { name: 'Keyboard', price: 89.99, category: 'Electronics', stock: 150 },
            { name: 'Notebook', price: 12.99, category: 'Stationery', stock: 300 },
            { name: 'Pen', price: 2.99, category: 'Stationery', stock: 500 }
        ]);
        console.log('📦 Added sample products');
    }

    const customersCount = await db.collection('customers').countDocuments();
    if (customersCount === 0) {
        await db.collection('customers').insertMany([
            { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
            { name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
            { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-123-4567' }
        ]);
        console.log('👥 Added sample customers');
    }
}

// ==============================================
// AUTHENTICATION MIDDLEWARE
// ==============================================
const auth = async (req, res, next) => {
    try {
        // 1. Get token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // 2. Check if token exists
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token, access denied' 
            });
        }
        
        // 3. Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 4. Find user by ID from token
        const user = await db.collection('users').findOne({ 
            _id: new ObjectId(decoded.userId) 
        });
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // 5. Remove password from user object
        delete user.password;
        
        // 6. Attach user to request object
        req.user = user;
        req.token = token;
        
        // 7. Continue to the route
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
};

// ==================== AUTHENTICATION API ====================
// Register new admin user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and password are required' 
            });
        }
        
        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user (all users are admins)
        const user = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };
        
        const result = await db.collection('users').insertOne(user);
        user._id = result.insertedId;
        
        // Create token
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Remove password from response
        delete user.password;
        
        res.status(201).json({
            success: true,
            message: 'Admin user registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

// Login admin user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Create token
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Remove password from response
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Get user profile (protected)
app.get('/api/auth/profile', auth, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ==================== PRODUCTS API ====================
app.get('/api/products', auth, async (req, res) => {
    try {
        const products = await db.collection('products').find({}).toArray();
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/products/:id', auth, async (req, res) => {
    try {
        const product = await db.collection('products').findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/products', auth, async (req, res) => {
    try {
        const { name, price, category, stock } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and price are required' 
            });
        }
        
        const product = {
            name,
            price: parseFloat(price),
            category: category || '',
            stock: parseInt(stock) || 0,
            createdAt: new Date(),
            createdBy: req.user._id
        };
        
        const result = await db.collection('products').insertOne(product);
        product._id = result.insertedId;
        
        res.status(201).json({ 
            success: true, 
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/products/:id', auth, async (req, res) => {
    try {
        const { name, price, category, stock } = req.body;
        const updateData = {};
        
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        updateData.updatedAt = new Date();
        
        const result = await db.collection('products').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        
        if (!result.value) {
            return res.status(404).json({ 
                success: false, 
                error: 'Product not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product updated successfully',
            data: result.value
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/products/:id', auth, async (req, res) => {
    try {
        const result = await db.collection('products').deleteOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Product not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ORDERS API ====================
app.get('/api/orders', auth, async (req, res) => {
    try {
        const orders = await db.collection('orders')
            .find({})
            .sort({ orderNumber: -1 })
            .toArray();
            
        // Transform _id to id for frontend compatibility
        const transformedOrders = orders.map(order => ({
            ...order,
            id: order._id
        }));
        
        res.json({ success: true, data: transformedOrders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/orders/:id', auth, async (req, res) => {
    try {
        const order = await db.collection('orders').findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        // Add id field for frontend
        order.id = order._id;
        
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/orders', auth, async (req, res) => {
    try {
        const { customerName, items, customerId } = req.body;
        
        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Customer name and at least one item are required' 
            });
        }
        
        // Get the next order number
        const lastOrder = await db.collection('orders')
            .find()
            .sort({ orderNumber: -1 })
            .limit(1)
            .toArray();
        
        const orderNumber = lastOrder.length > 0 ? lastOrder[0].orderNumber + 1 : 1001;
        
        // Calculate total and validate products
        let total = 0;
        for (const item of items) {
            if (!item.productId || !item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Each item must have productId and quantity' 
                });
            }
            
            // Get product price
            const product = await db.collection('products').findOne({
                _id: new ObjectId(item.productId)
            });
            
            if (!product) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Product not found: ${item.productId}` 
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                });
            }
            
            item.price = product.price;
            item.productName = product.name;
            total += product.price * item.quantity;
        }
        
        const order = {
            orderNumber,
            customerName,
            customerId: customerId || null,
            items,
            total,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: req.user._id
        };
        
        // 1. Insert order
        const result = await db.collection('orders').insertOne(order);
        order._id = result.insertedId;
        order.id = order._id;
        
        // 2. Update product stock
        for (const item of items) {
            await db.collection('products').updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { stock: -item.quantity } }
            );
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/orders/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Valid status is required: pending, processing, completed, cancelled' 
            });
        }
        
        const updateData = {
            status,
            updatedAt: new Date()
        };
        
        const result = await db.collection('orders').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        
        if (!result.value) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        // Add id field for frontend
        result.value.id = result.value._id;
        
        res.json({ 
            success: true, 
            message: 'Order status updated successfully',
            data: result.value
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/orders/:id', auth, async (req, res) => {
    try {
        // Get the order first to restore product stock
        const order = await db.collection('orders').findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        // Restore product stock if order is cancelled or deleted
        if (order.status !== 'cancelled') {
            for (const item of order.items) {
                await db.collection('products').updateOne(
                    { _id: new ObjectId(item.productId) },
                    { $inc: { stock: item.quantity } }
                );
            }
        }
        
        // Delete the order
        await db.collection('orders').deleteOne({
            _id: new ObjectId(req.params.id)
        });
        
        res.json({ 
            success: true, 
            message: 'Order deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== CUSTOMERS API ====================
app.get('/api/customers', auth, async (req, res) => {
    try {
        const customers = await db.collection('customers').find({}).toArray();
        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/customers/:id', auth, async (req, res) => {
    try {
        const customer = await db.collection('customers').findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!customer) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        
        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/customers', auth, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and email are required' 
            });
        }
        
        const customer = {
            name,
            email,
            phone: phone || '',
            createdAt: new Date(),
            createdBy: req.user._id
        };
        
        const result = await db.collection('customers').insertOne(customer);
        customer._id = result.insertedId;
        
        res.status(201).json({ 
            success: true, 
            message: 'Customer created successfully',
            data: customer
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/customers/:id', auth, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const updateData = {};
        
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        updateData.updatedAt = new Date();
        
        const result = await db.collection('customers').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        
        if (!result.value) {
            return res.status(404).json({ 
                success: false, 
                error: 'Customer not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Customer updated successfully',
            data: result.value
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/customers/:id', auth, async (req, res) => {
    try {
        // Check if customer has orders
        const ordersCount = await db.collection('orders').countDocuments({
            customerId: req.params.id
        });
        
        if (ordersCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete customer with existing orders' 
            });
        }
        
        const result = await db.collection('customers').deleteOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Customer not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Customer deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== SEARCH & STATS ====================
app.get('/api/orders/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ 
                success: false, 
                error: 'Search query is required' 
            });
        }
        
        const query = {
            $or: [
                { customerName: { $regex: q, $options: 'i' } },
                { 'items.productName': { $regex: q, $options: 'i' } }
            ]
        };
        
        // Check if query is a number (order number)
        if (!isNaN(q)) {
            query.$or.push({ orderNumber: parseInt(q) });
        }
        
        const orders = await db.collection('orders')
            .find(query)
            .sort({ orderNumber: -1 })
            .toArray();
            
        // Transform _id to id
        const transformedOrders = orders.map(order => ({
            ...order,
            id: order._id
        }));
        
        res.json({ success: true, data: transformedOrders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/stats', auth, async (req, res) => {
    try {
        const totalOrders = await db.collection('orders').countDocuments();
        const totalProducts = await db.collection('products').countDocuments();
        const totalCustomers = await db.collection('customers').countDocuments();
        
        const revenueResult = await db.collection('orders').aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]).toArray();
        
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
        res.json({
            success: true,
            data: {
                totalOrders,
                totalProducts,
                totalCustomers,
                totalRevenue: parseFloat(totalRevenue.toFixed(2))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== START SERVER ====================
connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔐 JWT Secret: ${JWT_SECRET}`);
        console.log(`👑 Admin: admin@example.com / admin123`);
        console.log(`📝 All registered users have full admin access`);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
    });
});