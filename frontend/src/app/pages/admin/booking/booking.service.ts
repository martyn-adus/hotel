import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {delay, map, Observable, timer} from 'rxjs';
import {finalize, race, tap} from 'rxjs/operators';

export type BookingStatus = 'pending' | 'confirmed' | 'declined';

export interface BookingRequest {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phoneNumber: string;
  email: string;
  checkInDate?: string;
  checkOutDate?: string;
  additionalWishes?: string;
  status: string;
  roomTypeId: string;
  fixPrice?: number;
  createdAt: string;
}

export interface BookingResponse {
  data: BookingRequest[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  bookings = signal<BookingRequest[]>([]);
  total = signal(0);
  loading = signal(false);

  loadAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    mobileNumber?: string;
  }): Observable<BookingResponse> {
    // Show loader only if request takes longer than 2 seconds
    const loaderTimer = timer(2000).subscribe(() => {
      this.loading.set(true);
    });

    const queryParams: any = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.search) queryParams.search = params.search;
    if (params?.mobileNumber) queryParams.mobileNumber = params.mobileNumber;

    return this.http.get<any>('/api/booking-requests', { params: queryParams }).pipe(
      map((res) => ({
        data: (res.data ?? []).map((x: any) => this.fromApi(x)),
        total: res.total ?? 0,
        page: res.page ?? 1,
        limit: res.limit ?? 10,
      })),
      tap((response) => {
        this.bookings.set(response.data);
        this.total.set(response.total);
      }),
      finalize(() => {
        loaderTimer.unsubscribe();
        this.loading.set(false);
      }),
    );
  }

  updateStatus(id: string, status: BookingStatus) {
    return this.http.patch(`/api/booking-requests/${id}`, { status });
  }

  update(id: string, data: any) {
    return this.http.patch(`/api/booking-requests/${id}`, data);
  }

  private fromApi(x: any): BookingRequest {
    return {
      id: x.id ?? x._id,

      firstName: x.firstName ?? x._firstName ?? '',
      lastName: x.lastName ?? x._lastName ?? '',
      patronymic: x.patronymic ?? x._patronymic ?? '',

      phoneNumber: x.phoneNumber ?? x._phoneNumber ?? '',
      email: x.email ?? x._email ?? '',

      checkInDate: x.checkInDate ?? x._checkInDate ?? '',
      checkOutDate: x.checkOutDate ?? x._checkOutDate ?? '',

      additionalWishes: x.additionalWishes ?? x._additionalWishes ?? '',
      status: (x.status ?? x._status ?? 'pending') as BookingStatus,

      roomTypeId: x.roomTypeId ?? x._roomTypeId ?? '',
      fixPrice: x.fixPrice != null ? Number(x.fixPrice) : x._fixPrice != null ? Number(x._fixPrice) : undefined,
      createdAt: x.createdAt ?? x._createdAt ?? '',
    };
  }
}
