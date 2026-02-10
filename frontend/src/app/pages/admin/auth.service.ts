import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {environment} from '../../../../environments/environment';

const TOKEN_KEY = 'hotel_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  token = signal<string | null>(this.readToken());

  authed(): boolean {
    return !!this.token();
  }

  private readToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private writeToken(token: string | null): void {
    if (!this.isBrowser) return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ accessToken: string }>(
        `${environment.apiUrl}/api/auth/login`,
        { email, password }
      )
    );

    this.writeToken(res.accessToken);
    this.token.set(res.accessToken);
  }

  logout(): void {
    this.writeToken(null);
    this.token.set(null);
  }
}
