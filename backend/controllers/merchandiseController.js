import Merchandise from '../models/Merchandise.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Stripe from 'stripe';

// Initialize Stripe
let stripe = null;
const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripe = new Stripe(secretKey);
  }
  return stripe;
};

// Get all active merchandise (for students)
export const getMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      merchandise
    });
  } catch (error) {
    console.error('Get merchandise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchandise.'
    });
  }
};

// Get single merchandise item
export const getMerchandiseById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Merchandise.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise not found.'
      });
    }
    
    res.status(200).json({
      success: true,
      merchandise: item
    });
  } catch (error) {
    console.error('Get merchandise by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchandise.'
    });
  }
};

// Admin: Get all merchandise (including inactive)
export const getAllMerchandise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const merchandise = await Merchandise.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      merchandise
    });
  } catch (error) {
    console.error('Get all merchandise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchandise.'
    });
  }
};

// Admin: Create merchandise
export const createMerchandise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const { name, description, price, stock, category, isActive } = req.body;
    
    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and stock are required.'
      });
    }
    
    // Handle image upload
    let image = '';
    if (req.file) {
      image = `/uploads/merchandise/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image; // Allow URL input
    }
    
    // Convert isActive from string to boolean (FormData sends strings)
    const isActiveBool = isActive === 'true' || isActive === true || isActive === undefined;
    
    const merchandise = new Merchandise({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category || 'General',
      isActive: isActiveBool,
      image
    });
    
    await merchandise.save();
    
    res.status(201).json({
      success: true,
      message: 'Merchandise created successfully.',
      merchandise
    });
  } catch (error) {
    console.error('Create merchandise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create merchandise.'
    });
  }
};

// Admin: Update merchandise
export const updateMerchandise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const { id } = req.params;
    const { name, description, price, stock, category, isActive } = req.body;
    
    const merchandise = await Merchandise.findById(id);
    if (!merchandise) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise not found.'
      });
    }
    
    // Update fields
    if (name) merchandise.name = name;
    if (description) merchandise.description = description;
    if (price !== undefined) merchandise.price = parseFloat(price);
    if (stock !== undefined) merchandise.stock = parseInt(stock);
    if (category) merchandise.category = category;
    if (isActive !== undefined) {
      // Convert isActive from string to boolean (FormData sends strings)
      merchandise.isActive = isActive === 'true' || isActive === true;
    }
    
    // Handle image update
    if (req.file) {
      merchandise.image = `/uploads/merchandise/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      merchandise.image = req.body.image; // Allow URL or empty string
    }
    
    await merchandise.save();
    
    res.status(200).json({
      success: true,
      message: 'Merchandise updated successfully.',
      merchandise
    });
  } catch (error) {
    console.error('Update merchandise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update merchandise.'
    });
  }
};

// Admin: Delete merchandise
export const deleteMerchandise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const { id } = req.params;
    const merchandise = await Merchandise.findById(id);
    
    if (!merchandise) {
      return res.status(404).json({
        success: false,
        message: 'Merchandise not found.'
      });
    }
    
    await Merchandise.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Merchandise deleted successfully.'
    });
  } catch (error) {
    console.error('Delete merchandise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete merchandise.'
    });
  }
};

// Create Stripe checkout session for merchandise
export const createMerchandiseCheckout = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { items, shippingAddress } = req.body; // items: [{merchandiseId, quantity}]
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required.'
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    // Validate items and calculate total
    const lineItems = [];
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const merchandise = await Merchandise.findById(item.merchandiseId);
      if (!merchandise) {
        return res.status(404).json({
          success: false,
          message: `Merchandise with ID ${item.merchandiseId} not found.`
        });
      }
      
      if (!merchandise.isActive) {
        return res.status(400).json({
          success: false,
          message: `${merchandise.name} is no longer available.`
        });
      }
      
      if (merchandise.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${merchandise.name}. Available: ${merchandise.stock}`
        });
      }
      
      const itemTotal = merchandise.price * item.quantity;
      totalAmount += itemTotal;
      
      // Build image URL for Stripe
      let imageUrl = '';
      if (merchandise.image) {
        if (merchandise.image.startsWith('http')) {
          imageUrl = merchandise.image;
        } else {
          imageUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}${merchandise.image}`;
        }
      }
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: merchandise.name,
            description: merchandise.description.substring(0, 200),
            images: imageUrl ? [imageUrl] : []
          },
          unit_amount: Math.round(merchandise.price * 100) // Convert to cents
        },
        quantity: item.quantity
      });
      
      orderItems.push({
        merchandise: merchandise._id,
        quantity: item.quantity,
        price: merchandise.price,
        name: merchandise.name
      });
    }
    
    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total amount must be greater than 0.'
      });
    }
    
    const stripeInstance = getStripe();
    
    // Create Stripe checkout session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merch/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merch/order/cancel`,
      customer_email: user.email,
      metadata: {
        studentId: userId.toString(),
        studentName: user.fullName || 'Student',
        orderType: 'merchandise'
      }
    });
    
    // Create order record
    const order = new Order({
      student: userId,
      items: orderItems,
      totalAmount,
      stripeSessionId: session.id,
      status: 'pending',
      shippingAddress: shippingAddress || {}
    });
    
    await order.save();
    
    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderId: order._id
    });
  } catch (error) {
    console.error('Create merchandise checkout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session.'
    });
  }
};

// Verify merchandise order payment
export const verifyMerchandiseOrder = async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required.'
      });
    }
    
    const order = await Order.findOne({ stripeSessionId: session_id })
      .populate('items.merchandise')
      .populate('student', 'fullName email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }
    
    // Check Stripe session status
    const stripeInstance = getStripe();
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Update order status
      order.status = 'completed';
      order.completedAt = new Date();
      order.paymentIntentId = session.payment_intent;
      await order.save();
      
      // Update stock for each item
      for (const item of order.items) {
        const merchandise = await Merchandise.findById(item.merchandise);
        if (merchandise) {
          merchandise.stock -= item.quantity;
          await merchandise.save();
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Order completed successfully.',
        order
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed.',
        order
      });
    }
  } catch (error) {
    console.error('Verify merchandise order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify order.'
    });
  }
};

// Get student's order history
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const orders = await Order.find({ student: userId })
      .populate('items.merchandise')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history.'
    });
  }
};

