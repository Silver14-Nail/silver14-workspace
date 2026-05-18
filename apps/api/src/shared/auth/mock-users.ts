export type MockUserRole = 'super_admin' | 'admin' | 'customer';

export type MockAuthUser = {
  email: string;
  id: string;
  name: string;
  password: string;
  role: MockUserRole;
  status: 'active' | 'disabled';
  pendingTwoFactorSecret?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
};

export type CreateMockCustomerUser = {
  email: string;
  name: string;
  password: string;
};

// MOCK ONLY: replace this array with rows from the users/admin_accounts table
// when the database repository is implemented. Keep the returned shape aligned
// with MockAuthUser or update AuthService mapping at the same time.
export const mockAuthUsers: MockAuthUser[] = [
  {
    email: 'owner@silver14.test',
    id: 'user-owner',
    name: 'Owner',
    password: 'password123',
    role: 'super_admin',
    status: 'active',
    twoFactorEnabled: false,
  },
  {
    email: 'admin@silver14.test',
    id: 'user-admin',
    name: 'Operations Admin',
    password: 'password123',
    role: 'admin',
    status: 'active',
  },
];

// MOCK ONLY: replace this array with rows from the customers/users table.
// Storefront checkout must remain guest-capable; this customer auth is only for
// account features such as order history, saved address, and wishlist.
export const mockCustomerUsers: MockAuthUser[] = [
  {
    email: 'customer@silver14.test',
    id: 'customer-demo',
    name: 'Demo Customer',
    password: 'password123',
    role: 'customer',
    status: 'active',
  },
];

export function addMockCustomerUser(user: CreateMockCustomerUser) {
  const customer: MockAuthUser = {
    email: user.email.toLowerCase(),
    id: `customer-${Date.now().toString(36)}`,
    name: user.name,
    password: user.password,
    role: 'customer',
    status: 'active',
  };

  mockCustomerUsers.push(customer);

  return customer;
}
