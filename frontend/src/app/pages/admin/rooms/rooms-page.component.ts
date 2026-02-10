import { Component, computed, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';

import { RoomsService } from './rooms.service';
import { Room } from './room.model';
import {DecimalPipe, NgClass} from '@angular/common';

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
    NgClass,
  ],
  templateUrl: './rooms-page.component.html',
  styleUrl: './rooms-page.component.scss',
})
export class RoomsPageComponent {
  private svc = inject(RoomsService);
  private fb = inject(FormBuilder);

  mode = signal<'create' | 'edit'>('create');
  selectedId = signal<string | null>(null);

  dialogVisible = false;

  photoUrl = '';
  photos = signal<string[]>([]);

  rooms = computed(() => this.svc.rooms());

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    type: ['', [Validators.required, Validators.minLength(2)]],
    pricePerNight: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });


  dialogWidth(): string {
    return window.innerWidth < 900 ? '96vw' : '980px';
  }

  openCreate() {
    this.mode.set('create');
    this.selectedId.set(null);
    this.form.reset({ title: '', type: '', pricePerNight: 0, description: '' });
    this.photos.set([]);
    this.dialogVisible = true;
  }

  openEdit(r: Room) {
    this.mode.set('edit');
    this.selectedId.set(r.id);
    this.form.reset({
      title: r.title,
      type: r.type,
      pricePerNight: r.pricePerNight,
      description: r.description,
    });
    this.photos.set([...(r.photos ?? [])]);
    this.dialogVisible = true;
  }

  addPhoto() {
    const url = (this.photoUrl || '').trim();
    if (!url) return;
    this.photos.set([url, ...this.photos()]);
    this.photoUrl = '';
  }

  removePhoto(i: number) {
    const next = [...this.photos()];
    next.splice(i, 1);
    this.photos.set(next);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.getRawValue(), photos: this.photos() };

    if (this.mode() === 'create') {
      this.svc.create(payload as any);
    } else {
      const id = this.selectedId();
      if (id) this.svc.update(id, payload as any);
    }

    this.dialogVisible = false;
  }

  remove(r: Room) {
    this.svc.remove(r.id);
  }
}
