export interface IpaginationOptions {
  searchText?: string;
  page: number;
  limit: number;
  category?: string;
  brand?: string;
  slug?: string;
  minPrice?: number;
  maxPrice?: number;
  filters?: Record<string, string | string[] | number>;
  sortBy?: string;
  sortDesc?: boolean;
  isAvailable?: boolean;
}
