import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: {
      seo: {
        title: 'Web- & Printdesign, Fotografie',
        description: 'Individuelle Designkonzepte aus Österreich: Ich gestalte hochwertige Printmedien (Speisekarten, Magazine), moderne Webauftritte und fotografiere vor Ort.'
      }
    }
  },
  {
    path: 'leistungen',
    loadComponent: () => import('./features/leistungen/leistungen.component').then(m => m.LeistungenComponent),
    data: {
      seo: {
        title: 'Leistungen',
        description: 'Mein Leistungsspektrum: Professionelles Webdesign, maßgeschneiderte Printmedien (Broschüren, Speisekarten), Branding, CI/CD, Social Media Content und Fotoshootings.'
      }
    }
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio.component').then(m => m.PortfolioComponent),
    data: {
      seo: {
        title: 'Portfolio',
        description: 'Sehen Sie sich meine Erfolgsgeschichten an: Von der Omnichannel-Speisekarte für Makani bis hin zu R&D Projektberichten und edlen Harfenbau-Websites.'
      }
    }
  },
  {
    path: 'portfolio/:project-slug',
    loadComponent: () => import('./features/portfolio-detail/portfolio-detail.component').then(m => m.PortfolioDetailComponent)
    // Dynamic titles and metadata will be managed inside the component via the SeoService
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    data: {
      seo: {
        title: 'Über Mich',
        description: 'Lernen Sie mich kennen. Als Designer und Fotograf verbinde ich kreative Ästhetik mit technischer Präzision für Ihren perfekten Markenauftritt.'
      }
    }
  },
  {
    path: 'impressum',
    loadComponent: () => import('./features/impressum/impressum.component').then(m => m.ImpressumComponent),
    data: {
      seo: {
        title: 'Impressum',
        description: 'Rechtliche Angaben, Anschrift und Kontaktinformationen von Marcel Pouget Designs.'
      }
    }
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./features/kontakt/kontakt.component').then(m => m.KontaktComponent),
    data: {
      seo: {
        title: 'Kontakt',
        description: 'Haben Sie Fragen zu meinen Leistungen oder möchten Sie ein neues Print-, Web- oder Fotoprojekt anfragen? Ich freue mich auf Ihre Nachricht.'
      }
    }
  },
  {
    path: 'datenschutz',
    loadComponent: () => import('./features/datenschutz/datenschutz.component').then(m => m.DatenschutzComponent),
    data: {
      seo: {
        title: 'Datenschutzerklärung',
        description: 'Datenschutzbestimmungen und Auswertungserklärung für Google Analytics.'
      }
    }
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: {
      seo: {
        title: 'Seite nicht gefunden',
        description: 'Fehler 404: Diese Seite existiert leider nicht mehr.'
      }
    }
  }
];
