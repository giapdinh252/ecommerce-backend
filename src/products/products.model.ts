export interface Product {
  product_id?: string;
  name: string;
  slug: string;
  description?: string;
  min_price: number;
  image_url: string;
  created_at?: Date;
}

export interface FilterOptions {
  RAM: string[];
  Color: string[];
  Storage: string[];
}

export interface ProductDetail {
  product_id: string;
  name: string;
  slug: string;
  min_price: number;
  category_slug: string;
  filter_options: FilterOptions;
  variants: {
    variant_id: string;
    sku: string;
    price: number;
    stock: number;
    specs: any;
    image: string | null;
  }[];
}

export interface ProductImage {
  image_url: string;
  is_main: boolean;
}

export interface ProductVariant {
  price: number;
  stock: number;
  sku: string;
  technical_specs: object;
  attribute_values: string[];
  images: ProductImage[];
}
export interface ProductModel {
  name: string;
  category_id: string;
  brand_id: string;
  description: string;
  slug: string;
  variants: ProductVariant[];
}
