import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './pages/admin/auth.interceptor';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes'

const Kaiserwald = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fbf7f0',
      100: '#f3ede3',
      200: '#e9dfd2',
      300: '#d7c19b',
      400: '#b99663',
      500: '#b99663',
      600: '#a88453',
      700: '#8f6f43',
      800: '#6f5633',
      900: '#3a2e1e',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#fbf7f0',
          50: '#f8f3ea',
          100: '#f3ede3',
          200: '#e9dfd2',
          300: '#dccfbf',
          400: '#cbb494',
          500: '#b99663',
          600: '#a88453',
          700: '#8f6f43',
          800: '#6f5633',
          900: '#1b1b18',
        }
      }
    }
  },
  components: {
    formField: {
      background: '#f3ede3',        // ← textarea / input background
      disabledBackground: '#ece6dc',
      filledBackground: '#f3ede3',

      color: '#2b2b2b',             // текст
      placeholderColor: '#8c8477',

      borderColor: '#d8cfc2',
      hoverBorderColor: '#b99663',
      focusBorderColor: '#b99663',

      borderRadius: '14px',
      paddingX: '1rem',
      paddingY: '0.75rem',

      transitionDuration: '120ms'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Kaiserwald
      },
      ripple: true
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ]
};
