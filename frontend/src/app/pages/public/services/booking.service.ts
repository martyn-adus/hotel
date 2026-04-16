import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private http = inject(HttpClient);

  createBooking(data: {
    firstName?: string | null;
    lastName?: string | null;
    patronymic?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    additionalWishes?: string | null;
    roomTypeId: string;
    fixPrice: number;
  }) {
    return this.http.post('/api/booking-requests', data);
  }

}
