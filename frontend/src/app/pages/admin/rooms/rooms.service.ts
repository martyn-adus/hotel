import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';

export interface RoomType {
  id: string;
  type: string;
  title: string;
  capacity: number;
  pricePerNight: number;
  description?: string;
  mediaUrls: string[];
  view: string[];
  comfort: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomTypeDto {
  type: string;
  title: string;
  capacity: number;
  pricePerNight: number;
  description?: string;
  mediaUrls?: string[];
  view?: string[];
  comfort?: string[];
}

export interface UpdateRoomTypeDto {
  type?: string;
  title?: string;
  capacity?: number;
  pricePerNight?: number;
  description?: string;
  mediaUrls?: string[];
  view?: string[];
  comfort?: string[];
}

@Injectable({ providedIn: 'root' })
export class RoomsService {
  private http = inject(HttpClient);
  private readonly endpoint = '/api/room-types';

  rooms = signal<RoomType[]>([]);
  loading = signal(false);

  loadAll() {
    this.loading.set(true);
    return this.http.get<any[]>(this.endpoint).pipe(
      tap((list) => this.rooms.set((list ?? []).map((x) => this.fromApi(x)))),
      finalize(() => this.loading.set(false)),
    );
  }

  create(payload: CreateRoomTypeDto) {
    return this.http.post<any>(this.endpoint, payload).pipe(
      tap((created) => this.rooms.set([this.fromApi(created), ...this.rooms()])),
    );
  }

  update(id: string, payload: UpdateRoomTypeDto) {
    return this.http.patch<any>(`${this.endpoint}/${id}`, payload).pipe(
      tap((updated) => {
        const u = this.fromApi(updated);
        this.rooms.set(this.rooms().map((r) => (r.id === id ? u : r)));
      }),
    );
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => this.rooms.set(this.rooms().filter((r) => r.id !== id))),
    );
  }

  private fromApi(x: any): RoomType {
    return {
      id: x.id ?? x._id,
      type: x.type ?? x._type ?? '',
      title: x.title ?? x._title ?? '',
      capacity: x.capacity ?? x._capacity ?? 1,
      pricePerNight: Number(x.pricePerNight ?? x._pricePerNight ?? 0),
      description: x.description ?? x._description ?? '',
      mediaUrls: x.mediaUrls ?? x._mediaUrls ?? [],
      view: x.view ?? x._view ?? [],
      comfort: x.comfort ?? x._comfort ?? [],
      createdAt: x.createdAt ?? x._createdAt,
      updatedAt: x.updatedAt ?? x._updatedAt,
    };
  }


}
