export interface Item {
  id: number;
  name: string;
  category: string;
  distance: string;
  status: string;
  image: string;
  description?: string;
  price?: string;
  rating?: number;
  ownerImage?: string;
  owner?: {
    name: string;
    verified: boolean;
  };
  location?: {
    area: string;
    description: string;
  };
}
