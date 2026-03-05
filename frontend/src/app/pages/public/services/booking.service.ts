import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private http = inject(HttpClient);

  createBooking(data: any) {
    return this.http.post('/api/booking-requests', data);
  }

}
