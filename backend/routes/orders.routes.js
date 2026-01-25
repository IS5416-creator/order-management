import clientPromise from '@/lib/mongodb';

// GET all orders
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const orders = await db.collection('orders')
      .find({})
      .sort({ orderNumber: -1 })
      .toArray();
    
    return Response.json({ orders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST new order
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const ordersCollection = db.collection('orders');
    
    const body = await request.json();
    
    // Get the highest order number
    const lastOrder = await ordersCollection
      .find()
      .sort({ orderNumber: -1 })
      .limit(1)
      .toArray();
    
    const newOrderNumber = lastOrder.length > 0 ? lastOrder[0].orderNumber + 1 : 1001;
    
    const order = {
      orderNumber: newOrderNumber,
      customerName: body.customerName,
      items: body.items || [],
      status: 'pending',
      total: body.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await ordersCollection.insertOne(order);
    
    return Response.json({
      message: 'Order created successfully',
      order: { ...order, _id: result.insertedId }
    }, { status: 201 });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}