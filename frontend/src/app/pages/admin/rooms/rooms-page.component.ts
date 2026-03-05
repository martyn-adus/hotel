import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';

import { FilesService} from '../../../shared/services/files.service';
import { RoomsService, RoomType } from './rooms.service';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-rooms-page',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    DecimalPipe,
    ConfirmDialogModule,
    NgClass,
  ],
  templateUrl: './rooms-page.component.html',
  styleUrl: './rooms-page.component.scss',
  providers: [ConfirmationService]
})
export class RoomsPageComponent implements OnInit {
  private svc = inject(RoomsService);
  private fb = inject(FormBuilder);
  private filesSvc = inject(FilesService);
  private confirm = inject(ConfirmationService);

  uploading = signal(false);

  mode = signal<'create' | 'edit'>('create');
  selectedId = signal<string | null>(null);

  dialogVisible = false;

  photos = signal<string[]>([]);

  rooms = computed(() => this.svc.rooms());

  form = this.fb.group({
    type: ['', [Validators.required, Validators.minLength(2)]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    capacity: [2, [Validators.required, Validators.min(1)]],
    viewText: [''],
    comfortText: [''],
    pricePerNight: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  private parseList(v: unknown): string[] {
    const s = String(v ?? '').trim();
    if (!s) return [];
    return s
      .split(/[,\n]/g)
      .map(x => x.trim())
      .filter(Boolean);
  }

  private joinList(arr: unknown): string {
    const a = Array.isArray(arr) ? arr : [];
    return a.filter(Boolean).join(', ');
  }

  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const selected = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!selected.length) return;

    const images = selected.filter(f => f.type.startsWith('image/'));
    if (!images.length) return;

    const tooBig = images.find(f => f.size > 10 * 1024 * 1024);
    if (tooBig) return;

    this.uploading.set(true);

    this.filesSvc.uploadImages(images).subscribe({
      next: (urls) => {
        const current = this.photos();
        const merged = [...urls, ...current].filter((v, i, a) => a.indexOf(v) === i);
        this.photos.set(merged);
      },
      error: (e) => {
        console.error(e)
        this.uploading.set(false);
      },
      complete: () => this.uploading.set(false)
    });
  }

  ngOnInit() {
    this.svc.loadAll().subscribe();
  }

  dialogWidth(): string {
    if (typeof window === 'undefined') return '980px';
    return window.innerWidth < 900 ? '96vw' : '980px';
  }

  openCreate() {
    this.mode.set('create');
    this.selectedId.set(null);
    this.form.reset({ type: '', title: '', capacity: 2, pricePerNight: 0, description: '', viewText: '', comfortText: '' });
    this.photos.set([]);
    this.dialogVisible = true;
  }

  openEdit(r: RoomType) {
    this.mode.set('edit');
    this.selectedId.set(r.id);

    this.form.reset({
      type: r.type,
      title: r.title,
      capacity: r.capacity,
      pricePerNight: r.pricePerNight,
      description: r.description ?? '',
      viewText: this.joinList(r.view),
      comfortText: this.joinList(r.comfort),
    });

    this.photos.set([...(r.mediaUrls ?? [])]);
    this.dialogVisible = true;
  }

  removePhoto(i: number) {
    const next = [...this.photos()];
    next.splice(i, 1);
    this.photos.set(next);
  }

  save() {
    if (this.uploading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.warn('Form invalid', this.form.getRawValue());
      return;
    }

    const v = this.form.getRawValue();

    const payload = {
      type: String(v.type ?? '').trim(),
      title: String(v.title ?? '').trim(),
      capacity: Number(v.capacity),
      pricePerNight: Number(v.pricePerNight),
      description: String(v.description ?? '').trim(),
      mediaUrls: this.photos(),
      view: this.parseList(v.viewText),
      comfort: this.parseList(v.comfortText),
    };

    if (this.mode() === 'create') {
      this.svc.create(payload).subscribe({
        next: () => {
          this.dialogVisible = false;
        },
        error: (err) => {
          console.error('Create failed', err);
        },
      });
      return;
    }

    const id = this.selectedId();
    if (!id) return;

    this.svc.update(id, payload).subscribe({
      next: () => {
        this.dialogVisible = false;
      },
      error: (err) => console.error('Update failed', err),
    });
  }

  confirmRemove(r: RoomType) {
    this.confirm.confirm({
      key: 'deleteRoomType',
      header: 'Видалити тип номеру?',
      message: `Тип "${r.type}" буде видалено без можливості відновлення.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Видалити',
      rejectLabel: 'Скасувати',
      accept: () => {
        this.svc.remove(r.id).subscribe();
      },
    });
  }
}
