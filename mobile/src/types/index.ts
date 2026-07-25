export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'customer';
  is_active: boolean;
}

export interface Customer {
  id: string;
  customer_type: 'parent' | 'teacher';
  child_name?: string;
  child_class?: string;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  available_date: string;
  status: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  price: number;
  category: 'food' | 'drink';
  is_available: boolean;
}

export interface Order {
  id: string;
  customer_id: string;
  menu_id: string;
  delivery_date: string;
  status: string;
  payment_method: string;
  payment_period: string;
  total_amount: number;
  items?: OrderItem[];
  customer?: Customer & { user: User };
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  menu_item?: MenuItem;
}

export interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  payment_method: string;
  payment_period: string;
  status: string;
  paid_at?: string;
  customer?: Customer & { user: User };
}

export interface Summary {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  today_revenue: number;
  today_orders: number;
}
