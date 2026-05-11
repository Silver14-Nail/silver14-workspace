import type { Order, CreateOrderRequest, UpdateOrderStatusRequest } from '@source/types';
import type { ProductInventory, UpdateInventoryRequest } from '@source/types';

const projectId = process.env.NX_SUPABASE_PROJECT_ID || '';
const publicAnonKey = process.env.NX_SUPABASE_PUBLIC_ANON_KEY || '';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-85024ff6`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// ============= ORDER API =============

export const createOrder = async (orderData: CreateOrderRequest): Promise<{ success: boolean; order?: Order; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

export const getOrder = async (orderId: string, phone: string): Promise<{ success: boolean; order?: Order; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}?phone=${encodeURIComponent(phone)}`, {
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: error.message };
  }
};

export const getAllOrders = async (): Promise<{ success: boolean; orders?: Order[]; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = async (data: UpdateOrderStatusRequest): Promise<{ success: boolean; order?: Order; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${data.orderId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};

// ============= PAYMENT API =============

export const createStripePaymentIntent = async (amount: number, orderId: string): Promise<{ success: boolean; clientSecret?: string; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/payment/stripe/create-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount, orderId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    return { success: false, error: error.message };
  }
};

export const createPayPalOrder = async (amount: number, orderId: string): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/payment/paypal/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount, orderId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return { success: false, error: error.message };
  }
};

export const capturePayPalPayment = async (paypalOrderId: string): Promise<{ success: boolean; captureData?: any; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/payment/paypal/capture/${paypalOrderId}`, {
      method: 'POST',
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return { success: false, error: error.message };
  }
};

// ============= INVENTORY API =============

export const getProductInventory = async (productId: string): Promise<{ success: boolean; inventory?: ProductInventory; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/inventory/${productId}`, {
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: error.message };
  }
};

export const updateProductInventory = async (data: UpdateInventoryRequest & { productName: string }): Promise<{ success: boolean; inventory?: ProductInventory; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/inventory/${data.productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, error: error.message };
  }
};

export const getAllInventory = async (): Promise<{ success: boolean; inventory?: ProductInventory[]; error?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/inventory`, {
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching all inventory:', error);
    return { success: false, error: error.message };
  }
};
