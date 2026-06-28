import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: {
      seo: {
        title: 'Home',
        description: 'Herzlich Willkommen bei Pouget Designs. Wir entwickeln Ihre performante Website mit modernsten Technologien.'
      }
    }
  },
  {
    path: 'leistungen',
    loadComponent: () => import('./features/leistungen/leistungen.component').then(m => m.LeistungenComponent),
    data: {
      seo: {
        title: 'Unsere Leistungen',
        description: 'Von SEO-Optimierung über Webdesign bis zur Backend-Entwicklung bieten wir maßgeschneiderte Lösungen.'
      }
    }
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio.component').then(m => m.PortfolioComponent),
    data: {
      seo: {
        title: 'Portfolio & Referenzen',
        description: 'Überzeugen Sie sich von unseren Projekten im Bereich Web-Applikationen und UI/UX Design.'
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
        description: 'Erfahren Sie mehr über Marcel Pouget Designs und unsere Philosophie für digitale Produkte.'
      }
    }
  },
  {
    path: 'impressum',
    loadComponent: () => import('./features/impressum/impressum.component').then(m => m.ImpressumComponent),
    data: {
      seo: {
        title: 'Impressum',
        description: 'Rechtliche Informationen und Kontaktangaben zu Marcel Pouget Designs.'
      }
    }
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./features/kontakt/kontakt.component').then(m => m.KontaktComponent),
    data: {
      seo: {
        title: 'Kontakt aufnehmen',
        description: 'Schreiben Sie uns oder rufen Sie uns an. Wir freuen uns auf Ihr Web-Projekt.'
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
