import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

export interface RouteSeoData {
  title?: string;
  description?: string;
  ogImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  initSeoListener() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe((data: any) => {
      const seo: RouteSeoData = data['seo'] || {};
      const title = seo.title ? `${seo.title} | Pouget Designs` : 'Pouget Designs | Web- & Printdesign, Fotografie';
      const desc = seo.description || 'Individuelle Designkonzepte aus Österreich: hochwertiges Printdesign, moderne Webauftritte und professionelle Fotografie.';
      const ogImage = seo.ogImage || 'assets/default-og.jpg';

      // Update document title
      this.titleService.setTitle(title);

      // Update meta tags
      this.updateMetaTag('description', desc);
      this.updateMetaTag('og:title', title);
      this.updateMetaTag('og:description', desc);
      this.updateMetaTag('og:image', ogImage);
      this.updateMetaTag('twitter:card', 'summary_large_image');
    });
  }

  private updateMetaTag(name: string, content: string) {
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      this.metaService.updateTag({ property: name, content });
    } else {
      this.metaService.updateTag({ name, content });
    }
  }
}
