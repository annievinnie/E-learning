import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import API from '../api';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: #666;
  font-size: '1.1rem';
  margin-bottom: 2rem;
`;

const MerchandiseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const MerchCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const MerchImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
`;

const MerchContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MerchName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const MerchDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MerchPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
`;

const MerchStock = styled.div`
  font-size: 0.85rem;
  color: ${props => props.inStock ? '#28a745' : '#dc3545'};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CartSection = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  min-width: 300px;
  max-width: 400px;
  z-index: 1000;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
`;

const CartTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: #333;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

const CartItemInfo = styled.div`
  flex: 1;
`;

const CartItemName = styled.div`
  font-weight: 500;
  color: #333;
`;

const CartItemQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  &:hover {
    background: #f5f5f5;
  }
`;

const CartTotal = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(86, 171, 47, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
`;

const StudentMerch = () => {
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchMerchandise();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('merchCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('merchCart', JSON.stringify(cart));
    if (cart.length > 0) {
      setShowCart(true);
    }
  }, [cart]);

  const fetchMerchandise = async () => {
    setLoading(true);
    try {
      const response = await API.get('/merchandise');
      if (response.data.success) {
        setMerchandise(response.data.merchandise || []);
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      alert('Failed to load merchandise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      if (existingItem.quantity >= item.stock) {
        alert('Cannot add more items. Stock limit reached.');
        return;
      }
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > item.stock) {
          alert('Cannot add more items. Stock limit reached.');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setCheckingOut(true);
    try {
      const items = cart.map(item => ({
        merchandiseId: item._id,
        quantity: item.quantity
      }));

      const response = await API.post('/merchandise/checkout', { items });
      
      if (response.data.success && response.data.url) {
        // Clear cart
        setCart([]);
        localStorage.removeItem('merchCart');
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        alert(response.data?.message || 'Failed to create checkout session.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to proceed to checkout. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  };

  return (
    <Container>
      <PageTitle>E-Learning Merchandise</PageTitle>
      <PageSubtitle>Shop our exclusive collection of E-Learning branded items!</PageSubtitle>

      {loading ? (
        <EmptyState>Loading merchandise...</EmptyState>
      ) : merchandise.length === 0 ? (
        <EmptyState>No merchandise available at the moment. Check back soon!</EmptyState>
      ) : (
        <MerchandiseGrid>
          {merchandise.map((item) => {
            const inCart = cart.find(cartItem => cartItem._id === item._id);
            const inStock = item.stock > 0;
            
            return (
              <MerchCard key={item._id}>
                <MerchImage imageUrl={getImageUrl(item.image)}>
                  {!item.image && <ShoppingCart size={48} />}
                </MerchImage>
                <MerchContent>
                  <MerchName>{item.name}</MerchName>
                  <MerchDescription>{item.description}</MerchDescription>
                  <MerchPrice>${item.price.toFixed(2)}</MerchPrice>
                  <MerchStock inStock={inStock}>
                    {inStock ? `In Stock (${item.stock} available)` : 'Out of Stock'}
                  </MerchStock>
                  <AddToCartButton
                    onClick={() => addToCart(item)}
                    disabled={!inStock || (inCart && inCart.quantity >= item.stock)}
                  >
                    <ShoppingCart size={20} />
                    {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
                  </AddToCartButton>
                </MerchContent>
              </MerchCard>
            );
          })}
        </MerchandiseGrid>
      )}

      {showCart && cart.length > 0 && (
        <CartSection>
          <CartHeader>
            <CartTitle>Shopping Cart</CartTitle>
            <button
              onClick={() => setShowCart(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </CartHeader>
          {cart.map((item) => (
            <CartItem key={item._id}>
              <CartItemInfo>
                <CartItemName>{item.name}</CartItemName>
                <CartItemQuantity>
                  <QuantityButton onClick={() => updateQuantity(item._id, -1)}>
                    <Minus size={16} />
                  </QuantityButton>
                  <span>{item.quantity}</span>
                  <QuantityButton onClick={() => updateQuantity(item._id, 1)}>
                    <Plus size={16} />
                  </QuantityButton>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Remove
                  </button>
                </CartItemQuantity>
              </CartItemInfo>
            </CartItem>
          ))}
          <CartTotal>
            <span>Total:</span>
            <span>${getTotal().toFixed(2)}</span>
          </CartTotal>
          <CheckoutButton onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
          </CheckoutButton>
        </CartSection>
      )}

      {cart.length > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            zIndex: 999
          }}
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#f5576c',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      )}
    </Container>
  );
};

export default StudentMerch;

