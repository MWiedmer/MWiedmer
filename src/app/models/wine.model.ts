export interface Wine {
  id?: number;
  name: string;
  vintage: number;
  producer: string;
  cost: number;
  rating: number;
  type: string;
  grape_id: number;
  grape?: string;
  labels: string[];
  quantity: number;
  country: string;
} 