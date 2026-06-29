export enum Scene {
  Opening = 1,
  Candles = 2,
  Cake = 3,
  Celebration = 4,
  Letter = 5,
  Timeline = 6,
  Gallery = 7,
  Counter = 8,
  Kiss = 9,
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  gradient: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  rotate: number;
}
