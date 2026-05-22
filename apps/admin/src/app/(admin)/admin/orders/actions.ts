'use server';

import { revalidatePath } from 'next/cache';
import {
  listOrders,
  getOrder,
  getOrderStats,
  updateOrderStatus,
  updatePaymentStatus,
  updateShipping,
  updateShippingFee,
  cancelOrder,
  deleteOrder,
} from '../../../../services/orders.service';
import type {
  OrderListQuery,
  OrderListResponse,
  OrderDetail,
  OrderStats,
  OrderStatus,
  PaymentStatus,
} from './types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function listOrdersAction(
  query?: OrderListQuery,
): Promise<ActionResult<OrderListResponse>> {
  try {
    const data = await listOrders(query);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load orders';
    return { success: false, error: message };
  }
}

export async function getOrderAction(id: string): Promise<ActionResult<OrderDetail>> {
  try {
    const data = await getOrder(id);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load order';
    return { success: false, error: message };
  }
}

export async function getOrderStatsAction(): Promise<ActionResult<OrderStats>> {
  try {
    const data = await getOrderStats();
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load order stats';
    return { success: false, error: message };
  }
}

export async function updateOrderStatusAction(
  id: string,
  payload: { status: OrderStatus; reason?: string },
): Promise<ActionResult<OrderDetail>> {
  try {
    const data = await updateOrderStatus(id, payload);
    revalidatePath('/admin/orders');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order status';
    return { success: false, error: message };
  }
}

export async function updatePaymentStatusAction(
  id: string,
  payload: { status: PaymentStatus; note?: string },
): Promise<ActionResult<void>> {
  try {
    await updatePaymentStatus(id, payload);
    revalidatePath('/admin/orders');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update payment status';
    return { success: false, error: message };
  }
}

export async function updateShippingAction(
  id: string,
  payload: { carrier?: string | null; trackingNumber?: string | null },
): Promise<ActionResult<OrderDetail>> {
  try {
    const data = await updateShipping(id, payload);
    revalidatePath('/admin/orders');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update shipping';
    return { success: false, error: message };
  }
}

export async function cancelOrderAction(
  id: string,
  payload: { reason?: string },
): Promise<ActionResult<OrderDetail>> {
  try {
    const data = await cancelOrder(id, payload);
    revalidatePath('/admin/orders');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to cancel order';
    return { success: false, error: message };
  }
}

export async function updateShippingFeeAction(
  id: string,
  payload: { shippingFee: number },
): Promise<ActionResult<OrderDetail>> {
  try {
    const data = await updateShippingFee(id, payload);
    revalidatePath('/admin/orders');
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update shipping fee';
    return { success: false, error: message };
  }
}

export async function deleteOrderAction(id: string): Promise<ActionResult<void>> {
  try {
    await deleteOrder(id);
    revalidatePath('/admin/orders');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete order';
    return { success: false, error: message };
  }
}
