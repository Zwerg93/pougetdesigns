import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { SeoService } from './core/services/seo.service';
import { RubyModeService } from './core/services/ruby-mode.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private seoService = inject(SeoService);
  public rubyModeService = inject(RubyModeService);

  ngOnInit() {
    // Initialise the global SEO listener to update titles and meta tags on route changes
    this.seoService.initSeoListener();
  }
}
