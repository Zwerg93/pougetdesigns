import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Activates modern Zoneless Change Detection (no zone.js overhead, purely signal-driven)
    provideZonelessChangeDetection(),
    
    // Configures routes, binds parameters, and enables scroll position restoration on navigate
    provideRouter(
      routes, 
      withComponentInputBinding(), 
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    
    // Enables client hydration with Event Replay for lightning fast loading speeds and SEO
    provideClientHydration(withEventReplay())
  ]
};
