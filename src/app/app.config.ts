import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LucideAngularModule, Trophy, Activity, Dribbble, Volleyball, Plus, Trash2, Edit2, Check, X, Shield, Star, Flag } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(
      LucideAngularModule.pick({
        Trophy,
        Activity,
        Dribbble,
        Volleyball,
        Plus,
        Trash2,
        Edit2,
        Check,
        X,
        Shield,
        Star,
        Flag
      })
    )
  ],
};
