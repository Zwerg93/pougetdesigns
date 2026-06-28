import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RubyModeService } from '../../../core/services/ruby-mode.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  public rubyModeService = inject(RubyModeService);

  // Signal for mobile menu responsive state
  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update(val => !val);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
