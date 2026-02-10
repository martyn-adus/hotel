import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [RouterModule, ButtonModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
