import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import {RoomsService, RoomType} from '../admin/rooms/rooms.service';


@Component({
  standalone: true,
  selector: 'public-home',
  imports: [ButtonModule, DecimalPipe],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.scss',
})
export class PublicHomeComponent implements OnInit {
  private roomsSvc = inject(RoomsService);
  private router = inject(Router);
  aboutImages = [
    '/hotel-4.jpg',
    '/hotel-2.jpg',
    '/hotel-3.jpg',
    '/hotel-1.jpg',
  ];

  roomTypes = computed(() => this.roomsSvc.rooms());
  loading = computed(() => this.roomsSvc.loading());

  heroImageUrl = '/keys.jpg';

  ngOnInit() {
    this.roomsSvc.loadAll().subscribe();
  }

  openDetails(r: RoomType) {
    this.router.navigate(['/rooms', r.id]);
  }

  scrollToRooms() {
    if (typeof document === 'undefined') return;
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToContacts() {
    if (typeof document === 'undefined') return;
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  primaryPhoto(r: RoomType): string | null {
    const arr = r.mediaUrls ?? [];
    return arr.length ? arr[0] : null;
  }
}
