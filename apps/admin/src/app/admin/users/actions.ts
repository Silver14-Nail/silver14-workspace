'use server';

import { revalidatePath } from 'next/cache';

import { deleteUser, getUser, updateUser } from '@/services/users.service';
import type { User } from '@/services/users.service';

export async function getUserAction(id: string): Promise<User> {
  return getUser(id);
}

export async function toggleUserActiveAction(id: string, isActive: boolean): Promise<User> {
  const user = await updateUser(id, { isActive });
  revalidatePath('/admin/users');
  return user;
}

export async function deleteUserAction(id: string): Promise<void> {
  await deleteUser(id);
  revalidatePath('/admin/users');
}

export async function deleteUsersAction(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteUser(id)));
  revalidatePath('/admin/users');
}
