import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { RoomsService } from '../../admin/rooms/rooms.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {BookingService} from '../services/booking.service';
import {TextareaModule} from 'primeng/textarea';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Component({
  standalone: true,
  selector: 'room-type-detail',
  imports: [
    ButtonModule,
    DecimalPipe,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule
  ],
  templateUrl: './room-type-detail.component.html',
  styleUrl: './room-type-detail.component.scss',
})
export class RoomTypeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomsSvc = inject(RoomsService);

  activeImg = signal<string | null>(null);

  idFromRoute =  toSignal(
    this.route.paramMap.pipe(map(params => params.get('id') ?? '')),
    {initialValue: ''}
  )
  id = computed(() => this.idFromRoute());

  room = computed(() => this.roomsSvc.rooms().find(x => x.id === this.id()) ?? null);

  heroUrl = computed(() => {
    const room = this.room();
    const list = room?.mediaUrls ?? [];
    return this.activeImg() ?? (list.length ? list[0] : null);
  });

  private fb = inject(FormBuilder);
  private bookingSvc = inject(BookingService);

  bookingVisible = false;
  loadingBooking = signal(false);

  bookingForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    patronymic: [null],
    phoneNumber: ['', Validators.required],
    email: [null, [Validators.email]],
    checkInDate: [this.getTodayDate(), Validators.required],
    checkOutDate: [this.getTodayDate(), Validators.required],
    additionalWishes: [null]
  });

  constructor() {
    effect(() => {
      this.id();
      this.activeImg.set(null);
    });
  }

  ngOnInit() {
    if (!this.roomsSvc.rooms().length) {
      this.roomsSvc.loadAll().subscribe();
    }
  }

  openBooking() {
    this.bookingVisible = true;
  }

  closeBooking() {
    this.bookingVisible = false;
    this.loadingBooking.set(false);
    this.bookingForm.reset();
  }

  submitBooking() {
    if (this.bookingForm.invalid || !this.room()) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.loadingBooking.set(true);

    const payload = {
      ...this.bookingForm.value,
      roomTypeId: this.room()!.id
    };

    this.bookingSvc.createBooking(payload).subscribe({
      next: () => {
        this.loadingBooking.set(false);
        this.bookingVisible = false;
        this.bookingForm.reset();
      },
      error: () => {
        this.loadingBooking.set(false);
        alert('Помилка відправки заявки');
      }
    });

  }

  setHero(url: string) {
    this.activeImg.set(url);
  }

  back() {
    this.router.navigate(['/']);
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
