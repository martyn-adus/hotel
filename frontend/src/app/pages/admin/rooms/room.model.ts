export type RoomStatus = 'ACTIVE' | 'HIDDEN';

export interface Room {
  id: string;
  title: string;        // "Deluxe 201"
  type: string;         // "Deluxe" / "Lux"
  pricePerNight: number;
  description: string;
  status: RoomStatus;
  photos: string[];     // URLs (поки що)
  updatedAt: string;
}
