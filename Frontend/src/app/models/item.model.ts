export interface Item {
  id?: number;
  title: string;
  description: string;
  pricePerDay: number;
  priceUnit: 'DAY' | 'HOUR';
  category: 'TOOLS' | 'KITCHEN' | 'CLEANING' | 'ELECTRONICS' | 'SPORTS' | 'GARDEN' | 'OTHER';
  location: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  condition: 'NEW' | 'LIKE_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  owner?: any; // We can define a User interface later if needed
  borrower?: any;
  dueDate?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rating?: number;
}
