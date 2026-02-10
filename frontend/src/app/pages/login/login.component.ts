import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import {AuthService} from '../admin/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = new FormBuilder();

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid = computed(() => this.form.invalid);

  constructor(private router: Router, private auth: AuthService) {}

  async submit(): Promise<void> {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();

      // ВАЖЛИВО: бекенд очікує email
      await this.auth.login(email!, password!);

      await this.router.navigateByUrl('/admin/rooms');
    } catch (e: any) {
      // якщо Nest повертає 401
      this.error.set('Невірний логін або пароль.');
    } finally {
      this.loading.set(false);
    }
  }



  get f() {
    return this.form.controls;
  }
}
