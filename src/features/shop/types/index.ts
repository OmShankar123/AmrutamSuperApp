export type ProductCategory =
  | 'Hair Care'
  | 'Skin Care'
  | 'Digestion & Gut'
  | 'Immunity'
  | 'Stress & Sleep'
  | 'Joint Care'
  | 'Women Health'
  | 'Men Health';

export type HealthConcern =
  | 'Hair Fall'
  | 'Dandruff'
  | 'Acne & Blemishes'
  | 'Acidity & Bloating'
  | 'Insomnia'
  | 'Joint Pain'
  | 'Low Energy'
  | 'Hormonal Balance';

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  category: ProductCategory;
  healthConcerns: readonly HealthConcern[];
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  description: string;
  ingredients: readonly string[];
  benefits: readonly string[];
  howToUse: string;
  size?: string;
  isBestseller?: boolean;
}

export interface ProductFilterParams {
  query?: string;
  category?: ProductCategory;
  healthConcern?: HealthConcern;
  healthConcerns?: readonly HealthConcern[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
  page?: number;
  limit?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}
