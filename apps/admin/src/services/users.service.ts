import { createApiClient } from './api-client';

export type UserRole = 'admin' | 'customer' | 'wholesale';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type UsersListResponse = {
  items: User[];
  pagination: PaginationMeta;
};

export type UsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
};

export async function listUsers(query: UsersQuery = {}): Promise<UsersListResponse> {
  const client = await createApiClient();
  const { data } = await client.get<UsersListResponse>('/admin-api/users', { params: query });
  return data;
}

export async function getUser(id: string): Promise<User> {
  const client = await createApiClient();
  const { data } = await client.get<User>(`/admin-api/users/${id}`);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const client = await createApiClient();
  const { data } = await client.patch<User>(`/admin-api/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const client = await createApiClient();
  await client.delete(`/admin-api/users/${id}`);
}
