import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RubyModeService {
  private active = signal(false);
  isRubyModeActive = this.active.asReadonly();

  triggerRubyMode() {
    if (this.active()) return;
    this.active.set(true);
    // Reset the state after the animation completes (3 seconds)
    setTimeout(() => {
      this.active.set(false);
    }, 3000);
  }
}
