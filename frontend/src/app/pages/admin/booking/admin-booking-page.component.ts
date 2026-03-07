import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { timer, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import {BookingRequest, BookingService, BookingStatus} from './booking.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ConfirmationService} from 'primeng/api';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {RoomsService, RoomType} from '../rooms/rooms.service';

@Component({
  standalone: true,
  selector: 'admin-booking-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DatePipe,
    ConfirmDialog,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    Select,
    Textarea
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-booking-page.component.html',
  styleUrl: './admin-booking-page.component.scss'
})
export class AdminBookingPage implements OnInit {
  private bookingSvc = inject(BookingService);
  private roomsSvc = inject(RoomsService);
  private destroyRef = inject(DestroyRef);
  private confirmSvc = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  bookings = this.bookingSvc.bookings;
  totalRecords = this.bookingSvc.total;
  loading = this.bookingSvc.loading;

  detailsVisible = false;
  selectedBooking = signal<BookingRequest | null>(null);
  selectedRoomType = signal<RoomType | null>(null);

  editMode = signal(false);
  saving = signal(false);

  roomTypes = computed(() => this.roomsSvc.rooms());

  editForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    patronymic: [''],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roomTypeId: ['', Validators.required],
    checkInDate: ['', Validators.required],
    checkOutDate: ['', Validators.required],
    additionalWishes: ['']
  });

  page = 1;
  limit = 10;

  searchName = signal('');
  searchPhone = signal('');

  private searchNameSubject = new Subject<string>();
  private searchPhoneSubject = new Subject<string>();

  ngOnInit() {
    // Load room types for dropdown
    if (!this.roomsSvc.rooms().length) {
      this.roomsSvc.loadAll().subscribe();
    }

    // Debounce search inputs
    this.searchNameSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.searchName.set(value);
        this.page = 1;
        this.loadBookings();
      });

    this.searchPhoneSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.searchPhone.set(value);
        this.page = 1;
        this.loadBookings();
      });

    // Auto-refresh every 10 seconds
    timer(10_000, 10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBookings();
      });
  }

  onNameSearchChange(value: string) {
    this.searchNameSubject.next(value);
  }

  onPhoneSearchChange(value: string) {
    this.searchPhoneSubject.next(value);
  }

  onPageChange(event: any) {

    // Calculate page from first (offset) and rows (limit)
    // first=0, rows=10 -> page 1
    // first=10, rows=10 -> page 2
    // first=20, rows=10 -> page 3
    this.limit = event.rows ?? 10;
    this.page = Math.floor((event.first ?? 0) / this.limit) + 1;


    this.loadBookings();
  }

  private loadBookings() {
    const params: any = {
      page: this.page,
      limit: this.limit,
    };

    if (this.searchName()) {
      params.search = this.searchName();
    }

    if (this.searchPhone()) {
      params.mobileNumber = this.searchPhone();
    }


    this.bookingSvc.loadAll(params).subscribe({
      error: (e) => console.error('Booking load failed', e),
    });
  }

  openDetails(booking: BookingRequest) {
    this.selectedBooking.set(booking);
    this.selectedRoomType.set(null);
    this.detailsVisible = true;

    // Fetch room type details
    if (booking.roomTypeId) {
      this.roomsSvc.getById(booking.roomTypeId).subscribe({
        next: (roomType) => this.selectedRoomType.set(roomType),
        error: (e) => console.error('Failed to load room type', e),
      });
    }
  }

  closeDetails() {
    this.detailsVisible = false;
    this.selectedBooking.set(null);
    this.selectedRoomType.set(null);
    this.editMode.set(false);
    this.editForm.reset();
  }

  startEdit() {
    const booking = this.selectedBooking();
    if (!booking) return;

    this.editForm.patchValue({
      firstName: booking.firstName,
      lastName: booking.lastName,
      patronymic: booking.patronymic || '',
      phoneNumber: booking.phoneNumber,
      email: booking.email,
      roomTypeId: booking.roomTypeId,
      checkInDate: booking.checkInDate ? this.formatDateForInput(booking.checkInDate) : '',
      checkOutDate: booking.checkOutDate ? this.formatDateForInput(booking.checkOutDate) : '',
      additionalWishes: booking.additionalWishes || ''
    });

    this.editMode.set(true);
  }

  cancelEdit() {
    this.editMode.set(false);
    this.editForm.reset();
  }

  saveEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const booking = this.selectedBooking();
    if (!booking) return;

    this.saving.set(true);

    this.bookingSvc.update(booking.id, this.editForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.editMode.set(false);
        this.closeDetails();
        this.loadBookings();
      },
      error: (e) => {
        console.error('Update failed', e);
        this.saving.set(false);
      }
    });
  }

  private formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  confirmBooking() {
    const booking = this.selectedBooking();
    if (!booking) return;

    this.setStatus(booking.id, 'confirmed');
  }

  declineBooking() {
    const booking = this.selectedBooking();
    if (!booking) return;

    this.setStatus(booking.id, 'declined');
  }

  private setStatus(id: string, status: BookingStatus) {
    this.bookingSvc.updateStatus(id, status).subscribe({
      next: () => {
        this.closeDetails();
        this.loadBookings();
      },
      error: (e) => console.error('Update status failed', e),
    });
  }
  }
