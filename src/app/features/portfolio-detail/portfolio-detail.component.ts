import { Component, input, inject, computed, effect, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './portfolio-detail.component.html'
})
export class PortfolioDetailComponent {
  private projectService = inject(ProjectService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private activatedRoute = inject(ActivatedRoute);

  // Bind the route param ':project-slug' directly to this Signal input, initializing from snapshot
  projectSlug = input<string | undefined>(
    this.activatedRoute.snapshot.paramMap.get('project-slug') || undefined,
    { alias: 'project-slug' }
  );

  // Computed signal to retrieve the project details
  project = computed(() => {
    const slug = this.projectSlug();
    return slug ? this.projectService.getProjectBySlug(slug)() : undefined;
  });

  // Lightbox state for showing fullscreen images on click
  activeLightboxImage = signal<string | null>(null);

  openLightbox(url: string) {
    this.activeLightboxImage.set(url);
  }

  closeLightbox() {
    this.activeLightboxImage.set(null);
  }

  constructor() {
    // Dynamically update document title and description when the project changes
    effect(() => {
      const p = this.project();
      if (p) {
        this.titleService.setTitle(`${p.title} | Pouget Designs Portfolio`);
        this.metaService.updateTag({ name: 'description', content: p.description });
        this.metaService.updateTag({ property: 'og:title', content: p.title });
        this.metaService.updateTag({ property: 'og:image', content: p.imageUrl });
      } else {
        this.titleService.setTitle('Projekt nicht gefunden | Pouget Designs');
      }
    });
  }
}
