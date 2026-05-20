import { httpClient } from '@/lib/http.client';

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
  const { data } = await httpClient.get<UsersListResponse>('/admin-api/users', { params: query });
  return data;
}

export async function getUser(id: string): Promise<User> {
  const { data } = await httpClient.get<User>(`/admin-api/users/${id}`);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await httpClient.patch<User>(`/admin-api/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/admin-api/users/${id}`);
}
