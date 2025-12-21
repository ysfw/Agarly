import { ItemCategory } from './enums/item.category.enum';
import { ItemRentalStatus } from './enums/item-rental-status.enum';
import { ItemStatus } from './enums/item-status.emun';
import { PriceUnit } from './enums/price-unit-enum';

export interface SearchCriteria {
  keyword?: string;
  category?: ItemCategory;

  minPrice?: number;
  maxPrice?: number;
  priceUnit?: PriceUnit;

  latitude?: number;
  longitude?: number;
  radius?: number;

  approvalStatus?: ItemStatus;
  rentalStatus?: ItemRentalStatus;

  sortBy?: 'price' | 'rating' | 'distance' | 'newest';
  sortDirection?: 'asc' | 'desc';
}
