export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string | null;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ReviewStats {
  average_rating: number;
  total: number;
  rating_distribution: { [key: number]: number };
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    price: string;
    image_url: string;
    compare_price?: string;
  };
}
