import { Injectable, signal, computed } from '@angular/core';

export interface Project {
  slug: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  pdfUrl?: string;
  pdfLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Signal containing our real projects data
  private projectsList = signal<Project[]>([
    {
      slug: 'askalaps-iot',
      title: 'Askalaps: IoT-Hardware trifft auf Enterprise SaaS',
      category: 'IoT & Web-Applikation',
      description: 'Entwicklung einer intelligenten Benutzeroberfläche zur Visualisierung und Steuerung von 5 E-Auto-Ladestationen (Wallboxen der Marke I-CHARGE CION) im firmeneigenen Netzwerk der Flexsolution GmbH. Das System ermöglicht die Echtzeit-Steuerung des Ladestroms in kW/h sowie die Priorisierung von Ladevorgängen.',
      imageUrl: 'Askalaps/teaser.webp',
      technologies: ['Angular 21', 'Quarkus (Java)', 'WebSockets', 'Docker','LoRaWAN', 'ESP32 (C++)', 'MQTT / ALBP'],
      pdfUrl: 'Projektberichte/Askalaps Projektbericht.pdf',
      pdfLabel: 'Projektbericht'
    },
    {
      slug: 'diplomarbeit-lademanager',
      title: 'Smart EV-Charging System: IoT & Energy Management',
      category: 'Forschung & Entwicklung',
      description: 'Verfassung und Ausarbeitung der wissenschaftlichen Diplomarbeit im Rahmen der Reife- und Diplomprüfung an der HTL Leonding. Konzeptioniert für den Projektpartner Flexsolution GMBH zur effizienten Erfassung, Verarbeitung und langfristigen Speicherung von Maschinen- und Sensordaten in einer PostgreSQL-Datenbank.',
      imageUrl: 'diplomarbeit/teaser.webp',
      technologies: ['Java', 'Modbus RTU/TCP', 'Raspberry Pi 4', 'Beckhoff', 'Jlibmodbus', 'PostgreSQL'],
      pdfUrl: 'diplomarbeit/diplomarbeit.pdf',
      pdfLabel: 'Diplomarbeit'
    },
    {
      slug: 'harfenbau-reschenhofer',
      title: 'Harfenbau Reschenhofer: Moderne Web-Architektur für traditionelles Handwerk',
      category: 'Webauftritt & Design',
      description: 'Entwicklung einer stilvollen, modernen Website für die Meisterwerkstatt von Franz Reschenhofer zur Präsentation von edlen Konzertharfen (wie Harfe Tribella und Harfe Linde) sowie die Bewerbung und Anmeldung zu Seminaren, Harfen-Workshops und Gesangskursen.',
      imageUrl: 'Harfenbau/teaser.webp',
      technologies: ['Angular 21', 'Bootstrap', 'Screendesign', 'SEO-Optimierung'],
      pdfUrl: 'Projektberichte/Harfenbau Projektbericht.pdf',
      pdfLabel: 'Projektbericht'
    },
    {
      slug: 'makani-bowls',
      title: 'Makani Bowls \'n Rolls: Omnichannel Menü- & Layout-Design',
      category: 'Editorial Design / Print Production / Digital Signage',
      description: 'Gestaltung und Umsetzung des Omnichannel Menü- & Layout-Designs für Makani Bowls \'n Rolls. Ganzheitliches visuelles Konzept für gedruckte Tischkarten bis hin zu digitalen Menü-Screens (Digital Signage) über der Kasse zur optimalen Informationsarchitektur.',
      imageUrl: 'Makani/teaser.webp',
      technologies: ['Figma', 'Affinity Publisher', 'Affinity Designer', 'BA-Connect'],
      pdfUrl: 'Projektberichte/Makani Projektbericht.pdf',
      pdfLabel: 'Projektbericht'
    }
  ]);

  // Read-only public signal
  projects = this.projectsList.asReadonly();

  // Returns a computed signal querying a project by its slug
  getProjectBySlug(slug: string) {
    return computed(() => this.projectsList().find(p => p.slug === slug));
  }
}
