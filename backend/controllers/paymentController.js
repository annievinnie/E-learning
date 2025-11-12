import Stripe from 'stripe';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// Initialize Stripe (lazy initialization)
let stripe = null;

const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
      console.error('Please add STRIPE_SECRET_KEY to your .env file');
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    
    // Validate key format (Stripe keys start with sk_ for secret keys)
    if (!secretKey.startsWith('sk_')) {
      console.error('❌ STRIPE_SECRET_KEY appears to be invalid (should start with sk_)');
      throw new Error('Invalid STRIPE_SECRET_KEY format');
    }
    
    try {
      stripe = new Stripe(secretKey);
      console.log('✅ Stripe initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error.message);
      throw error;
    }
  }
  return stripe;
};

// Create Stripe checkout session for course enrollment
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if course is active
    if (course.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This course is not available for enrollment.'
      });
    }

    // Check if already enrolled
    const isEnrolled = course.students.some(
      studentId => studentId.toString() === userId.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.'
      });
    }

    // Calculate amount (in cents for Stripe)
    const amount = course.price || 0;

    // Check if amount is valid
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Course price must be greater than 0. Please contact support.'
      });
    }

    const amountInCents = Math.round(amount * 100);

    // Validate Stripe initialization
    let stripeInstance;
    try {
      stripeInstance = getStripe();
    } catch (stripeError) {
      console.error('❌ Stripe initialization error:', stripeError.message);
      console.error('Error stack:', stripeError.stack);
      
      // Provide more helpful error message
      let errorMessage = 'Payment service configuration error. Please contact support.';
      if (stripeError.message.includes('not set')) {
        errorMessage = 'Payment service is not configured. Please contact the administrator.';
      } else if (stripeError.message.includes('Invalid')) {
        errorMessage = 'Payment service configuration is invalid. Please contact the administrator.';
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          error: stripeError.message,
          hint: 'Check that STRIPE_SECRET_KEY is set in your .env file'
        })
      });
    }

    // Prepare thumbnail image URL for Stripe (must be a valid HTTP/HTTPS URL)
    let thumbnailImages = [];
    if (course.thumbnail) {
      let thumbnailUrl = course.thumbnail;
      
      // Convert relative paths to full URLs
      if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
        // If it's a relative path, make it a full URL
        if (thumbnailUrl.startsWith('/')) {
          thumbnailUrl = `http://localhost:5000${thumbnailUrl}`;
        } else {
          // If it doesn't start with /, it might be just a filename
          thumbnailUrl = `http://localhost:5000/${thumbnailUrl}`;
        }
      }
      
      // Validate it's a proper URL before adding
      if (thumbnailUrl && (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://'))) {
        thumbnailImages = [thumbnailUrl];
      }
    }

    console.log('📸 Course thumbnail for Stripe:', thumbnailImages.length > 0 ? thumbnailImages[0] : 'No thumbnail (using empty array)');

    // Create Stripe checkout session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: (course.description || course.subtitle || 'Course enrollment').substring(0, 200),
              images: thumbnailImages, // Only include valid URLs
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?course_id=${courseId}`,
      customer_email: user.email,
      metadata: {
        studentId: userId,
        courseId: courseId,
        studentName: user.fullName,
        courseTitle: course.title,
      },
      client_reference_id: `${userId}_${courseId}`,
    });

    // Create payment record with pending status
    try {
      const payment = new Payment({
        student: userId,
        course: courseId,
        amount: amount,
        stripeSessionId: session.id,
        status: 'pending'
      });

      await payment.save();
      console.log('✅ Payment record created successfully');
    } catch (paymentError) {
      // If payment record creation fails (e.g., duplicate key), log but don't fail the checkout
      console.error('⚠️  Warning: Failed to save payment record:', paymentError.message);
      // Still proceed with returning the checkout URL
      // The payment can be tracked via the Stripe session ID
    }

    console.log('✅ Stripe checkout session created successfully');
    console.log('Session ID:', session.id);
    console.log('Checkout URL:', session.url);

    if (!session.url) {
      console.error('❌ Stripe session created but URL is missing!');
      return res.status(500).json({
        success: false,
        message: 'Payment session created but checkout URL is missing. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      stack: error.stack
    });

    if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid payment request.'
      });
    }

    if (error.message && error.message.includes('apiKey')) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured. Please contact support.'
      });
    }

    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message || 'Failed to create checkout session.'
      : 'Failed to create checkout session. Please try again later.';

    res.status(500).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Verify payment and enroll student
export const verifyPaymentAndEnroll = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required.'
      });
    }

    // Validate Stripe initialization
    let stripeInstance;
    try {
      stripeInstance = getStripe();
    } catch (stripeError) {
      console.error('❌ Stripe initialization error:', stripeError.message);
      return res.status(500).json({
        success: false,
        message: 'Payment service configuration error.',
        ...(process.env.NODE_ENV === 'development' && { 
          error: stripeError.message,
          hint: 'Check that STRIPE_SECRET_KEY is set in your .env file'
        })
      });
    }

    // Retrieve session from Stripe
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Payment session not found.'
      });
    }

    // Check if payment is completed
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed yet.'
      });
    }

    // Get payment record
    const payment = await Payment.findOne({ stripeSessionId: session_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    // If already processed, return success
    if (payment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and enrollment successful.'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.paymentIntentId = session.payment_intent;
    await payment.save();

    // Enroll student in course
    const course = await Course.findById(payment.course);
    if (course) {
      // Check if already enrolled (handle both old and new format)
      const isEnrolled = course.students.some(student => {
        if (typeof student === 'object' && student.studentId) {
          return student.studentId.toString() === payment.student.toString();
        }
        return student.toString() === payment.student.toString();
      });

      if (!isEnrolled) {
        // Get student details for enrollment
        const studentUser = await User.findById(payment.student).select('fullName');
        
        // Add student in the new format
        course.students.push({
          studentId: payment.student,
          studentName: studentUser?.fullName || 'Student',
          enrolledAt: new Date()
        });
        await course.save();
        console.log(`✅ Student ${payment.student} enrolled in course ${course._id}`);
      } else {
        console.log(`ℹ️  Student ${payment.student} already enrolled in course ${course._id}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment successful.'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Handle Stripe webhook
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripeInstance = getStripe();
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Update payment status
      const payment = await Payment.findOne({ stripeSessionId: session.id });

      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.completedAt = new Date();
        payment.paymentIntentId = session.payment_intent;
        await payment.save();

        // Enroll student in course
        const course = await Course.findById(payment.course);
        if (course) {
          const isEnrolled = course.students.some(
            studentId => studentId.toString() === payment.student.toString()
          );

          if (!isEnrolled) {
            course.students.push(payment.student);
            await course.save();
          }
        }
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
};

// Get payment history for a student
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const payments = await Payment.find({ student: userId })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

