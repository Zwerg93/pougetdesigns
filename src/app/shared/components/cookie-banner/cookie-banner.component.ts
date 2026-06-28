import { Component, inject } from '@angular/core';
import { ConsentService } from '../../../core/services/consent.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  templateUrl: './cookie-banner.component.html'
})
export class CookieBannerComponent {
  consentService = inject(ConsentService);

  acceptAll() {
    this.consentService.updateConsent('granted');
  }

  acceptNone() {
    this.consentService.updateConsent('denied');
  }
}
