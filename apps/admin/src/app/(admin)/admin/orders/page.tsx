import { listOrders, getOrderStats } from '../../../../services/orders.service';
import { OrdersClient } from './_components/OrdersClient';
import type { OrderStatus, PaymentStatus, OrderListQuery } from './types';

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;

  const query: OrderListQuery = {
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
    search: params.search || undefined,
    status: params.status as OrderStatus | undefined,
    paymentStatus: params.paymentStatus as PaymentStatus | undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    sortBy: (params.sortBy as OrderListQuery['sortBy']) || 'createdAt',
    sortOrder: (params.sortOrder as 'ASC' | 'DESC') || 'DESC',
  };

  const [ordersResult, statsResult] = await Promise.allSettled([
    listOrders(query),
    getOrderStats(),
  ]);

  const initialOrders =
    ordersResult.status === 'fulfilled'
      ? ordersResult.value
      : {
          items: [],
          pagination: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 20,
            totalPages: 0,
            currentPage: 1,
          },
        };

  const initialStats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  return (
    <OrdersClient initialOrders={initialOrders} initialStats={initialStats} currentQuery={query} />
  );
}
