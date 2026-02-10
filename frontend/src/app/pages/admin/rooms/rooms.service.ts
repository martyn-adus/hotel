import { Injectable, signal } from '@angular/core';
import { Room } from './room.model';

const KEY = 'hotel_rooms_v1';

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const seed: Room[] = [
  {
    id: 'r1',
    title: 'Deluxe 201',
    type: 'Deluxe',
    pricePerNight: 2200,
    description: 'Світлий номер з великим ліжком, балконом та видом на місто.',
    status: 'ACTIVE',
    photos: [],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    title: 'Lux 301',
    type: 'Lux',
    pricePerNight: 3500,
    description: 'Преміум люкс з зоною відпочинку та ванною кімнатою.',
    status: 'ACTIVE',
    photos: [],
    updatedAt: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class RoomsService {
  rooms = signal<Room[]>(this.load());

  private load(): Room[] {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Room[];
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }

  private save(next: Room[]) {
    localStorage.setItem(KEY, JSON.stringify(next));
    this.rooms.set(next);
  }

  create(partial: Omit<Room, 'id' | 'updatedAt'>) {
    const next: Room = { ...partial, id: uid(), updatedAt: new Date().toISOString() };
    this.save([next, ...this.rooms()]);
  }

  update(id: string, patch: Partial<Omit<Room, 'id'>>) {
    const next = this.rooms().map(r => r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r);
    this.save(next);
  }

  remove(id: string) {
    this.save(this.rooms().filter(r => r.id !== id));
  }
}
