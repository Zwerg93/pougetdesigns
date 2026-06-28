import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ConsentStatus = 'pending' | 'granted' | 'denied';

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'cookie-consent-status';
  private readonly gaTrackingId = 'G-XXXXXXXXXX'; // Replace with actual measurement ID

  // Signal for global consent state
  consentStatus = signal<ConsentStatus>('pending');

  constructor() {
    // Load initial consent state from localStorage (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      const savedStatus = localStorage.getItem(this.storageKey) as ConsentStatus;
      if (savedStatus) {
        this.consentStatus.set(savedStatus);
      }
    }

    // Effect to react to consent changes and load Google Analytics when granted
    effect(() => {
      const status = this.consentStatus();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, status);
        if (status === 'granted') {
          this.loadGoogleAnalytics();
        }
      }
    });
  }

  updateConsent(status: ConsentStatus) {
    this.consentStatus.set(status);
  }

  private loadGoogleAnalytics() {
    if (typeof window === 'undefined' || document.getElementById('google-analytics-script')) {
      return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaTrackingId}`;
    document.head.appendChild(script);

    // Initialize gtag configuration
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.gaTrackingId}', { 'anonymize_ip': true });
    `;
    document.head.appendChild(inlineScript);
    console.log('Google Analytics script dynamically loaded following user consent.');
  }
}
