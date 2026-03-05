import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { timer } from 'rxjs';

import {BookingService, BookingStatus} from './booking.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ConfirmationService} from 'primeng/api';
import {ConfirmDialog} from 'primeng/confirmdialog';

@Component({
  standalone: true,
  selector: 'admin-booking-page',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    DatePipe,
    ConfirmDialog
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-booking-page.component.html',
  styleUrl: './admin-booking-page.component.scss'
})
export class AdminBookingPage implements OnInit {
  private bookingSvc = inject(BookingService);
  private destroyRef = inject(DestroyRef);
  private confirmSvc = inject(ConfirmationService);

  bookings = this.bookingSvc.bookings;
  loading = this.bookingSvc.loading;

  ngOnInit() {
    timer(0, 10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.bookingSvc.loadAll().subscribe({
          error: (e) => console.error('Booking load failed', e),
        });
      });
  }

  askConfirm(ev: MouseEvent, id: string) {
    ev.stopPropagation();

    this.confirmSvc.confirm({
      key: 'bookingStatus',
      header: 'Підтвердження',
      message: 'Підтвердити цю заявку на бронювання?',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Підтвердити',
      rejectLabel: 'Скасувати',
      accept: () => this.setStatus(id, 'confirmed'),
    });
  }

  askDecline(ev: MouseEvent, id: string) {
    ev.stopPropagation();

    this.confirmSvc.confirm({
      key: 'bookingStatus',
      header: 'Підтвердження',
      message: 'Відхилити цю заявку на бронювання?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Відхилити',
      rejectLabel: 'Скасувати',
      accept: () => this.setStatus(id, 'declined'),
    });
  }

  private setStatus(id: string, status: BookingStatus) {
    this.bookingSvc.updateStatus(id, status).subscribe({
      next: () => {
        this.bookingSvc.loadAll().subscribe({
          error: (e) => console.error('Booking reload failed', e),
        });
      },
      error: (e) => console.error('Update status failed', e),
    });
  }
  }
