export interface SparePart {
  id: string;
  part_code: string;
  name: string;
  description?: string;
  machine_type: string;
  category: string;
  quantity_in_stock: number;
  minimum_stock_level: number;
  storage_location: string;
  supplier_id: string;
  unit_price: number;
  service_life_months: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  machine_code: string;
  name: string;
  type: string;
  location: string;
  status: 'operational' | 'maintenance' | 'offline';
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  part_id: string;
  machine_id: string;
  operator_name: string;
  quantity_used: number;
  maintenance_date: string;
  maintenance_type: 'routine' | 'repair' | 'replacement';
  notes?: string;
  created_at: string;
}

export interface StockAlert {
  id: string;
  part_id: string;
  alert_type: 'low_stock' | 'maintenance_due' | 'expired';
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'technician' | 'warehouse_manager' | 'maintenance_supervisor';
  created_at: string;
}