import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';

export type BookingStatus = 'pending' | 'confirmed' | 'declined';

export interface BookingRequest {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phoneNumber: string;
  email: string;
  additionalWishes?: string;
  status: string;
  roomTypeId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  bookings = signal<BookingRequest[]>([]);
  loading = signal(false);

  loadAll(): Observable<BookingRequest[]> {
    this.loading.set(true);

    return this.http.get<unknown[]>('/api/booking-requests').pipe(
      map((res) => (res ?? []).map((x) => this.fromApi(x))),
      tap((mapped) => this.bookings.set(mapped)),
      finalize(() => this.loading.set(false)),
    );
  }

  updateStatus(id: string, status: BookingStatus) {
    return this.http.patch(`/api/booking-requests/${id}`, { status });
  }

  private fromApi(x: any): BookingRequest {
    return {
      id: x.id ?? x._id,

      firstName: x.firstName ?? x._firstName ?? '',
      lastName: x.lastName ?? x._lastName ?? '',
      patronymic: x.patronymic ?? x._patronymic ?? '',

      phoneNumber: x.phoneNumber ?? x._phoneNumber ?? '',
      email: x.email ?? x._email ?? '',

      additionalWishes: x.additionalWishes ?? x._additionalWishes ?? '',
      status: (x.status ?? x._status ?? 'pending') as BookingStatus,

      roomTypeId: x.roomTypeId ?? x._roomTypeId ?? '',
      createdAt: x.createdAt ?? x._createdAt ?? '',
    };
  }
}
