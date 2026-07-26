export type Role = 'admin' | 'customer';
export type CustomerType = 'parent' | 'teacher';
export type MenuStatus = 'active' | 'closed' | 'cancelled';
export type ItemCategory = 'food' | 'drink';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer';
export type PaymentPeriod = 'daily' | 'weekly' | 'monthly';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';
export type InvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'cancelled';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_type: CustomerType;
  child_name?: string;
  child_class?: string;
  notes?: string;
  created_at: string;
}

export interface UserWithCustomer extends User {
  customer?: Customer;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  available_date: string;
  order_deadline?: string;
  status: MenuStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  price: number;
  category: ItemCategory;
  is_available: boolean;
  image_url?: string | null;
  catalog_item_id?: string | null;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  category_id?: string | null;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  image_url?: string | null;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  menu_id: string;
  order_date: string;
  delivery_date: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_period: PaymentPeriod;
  notes?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: UserWithCustomer;
  menu?: Menu;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  menu_item?: MenuItem;
}

export interface Invoice {
  id: string;
  customer_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  status: InvoiceStatus;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: UserWithCustomer;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  customer_id: string;
  invoice_id?: string;
  order_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_period: PaymentPeriod;
  status: PaymentStatus;
  paid_at?: string;
  transaction_id?: string;
  confirmed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: UserWithCustomer;
}

export interface PaymentLog {
  id: string;
  payment_id: string;
  gateway: string;
  gateway_transaction_id?: string;
  event_type?: string;
  raw_response: any;
  status?: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  customer_type: CustomerType;
  child_name?: string;
  child_class?: string;
  notes?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateMenuPayload {
  name: string;
  description?: string;
  available_date: string;
  order_deadline?: string;
  items: {
    name: string;
    description?: string;
    price: number;
    category: ItemCategory;
  }[];
}

export interface CreateOrderPayload {
  menu_id: string;
  delivery_date: string;
  payment_method: PaymentMethod;
  payment_period: PaymentPeriod;
  notes?: string;
  items: {
    menu_item_id: string;
    quantity: number;
  }[];
}

export interface ReportsFilter {
  start_date?: string;
  end_date?: string;
  payment_method?: PaymentMethod;
  payment_period?: PaymentPeriod;
}

export interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  transfer_revenue: number;
  total_items_sold: number;
}

export interface PeriodReport {
  period: string;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  payments: Payment[];
}
