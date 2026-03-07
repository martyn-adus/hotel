import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { RoomsPageComponent } from './pages/admin/rooms/rooms-page.component';
import { authGuard } from './pages/admin/auth.guard';
import {PublicHomeComponent} from './pages/public/public-home.component';
import {RoomTypeDetailComponent} from './pages/public/pages/room-type-detail.component';
import {AdminBookingPage} from './pages/admin/booking/admin-booking-page.component';

export const routes: Routes = [
  // PUBLIC (users)
  { path: '', component: PublicHomeComponent },
  { path: 'rooms/:id', component: RoomTypeDetailComponent },

  // ADMIN
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'booking' },
      { path: 'rooms', component: RoomsPageComponent },
      { path: 'booking', component: AdminBookingPage }
    ],
  },

  // fallback
  { path: '**', redirectTo: '' },
];

