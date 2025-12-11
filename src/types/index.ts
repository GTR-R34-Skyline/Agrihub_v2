export type UserRole = 'farmer' | 'buyer' | 'agronomist' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string;
  title: string;
  description?: string;
  price: number;
  unit: string;
  quantity_available: number;
  images: string[];
  location?: string;
  status: 'active' | 'sold' | 'draft';
  created_at: string;
  updated_at: string;
  seller?: Profile;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Advisor {
  id: string;
  user_id: string;
  specialization: string[];
  experience_years?: number;
  hourly_rate?: number;
  available: boolean;
  rating: number;
  total_consultations: number;
  profile?: Profile;
}

export interface Consultation {
  id: string;
  advisor_id: string;
  farmer_id: string;
  scheduled_at?: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category?: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Diagnosis {
  id: string;
  user_id: string;
  image_url: string;
  crop_type?: string;
  diagnosis?: string;
  confidence?: number;
  recommendations: string[];
  created_at: string;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}
