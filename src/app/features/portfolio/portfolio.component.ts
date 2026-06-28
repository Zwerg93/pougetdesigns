import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './portfolio.component.html'
})
export class PortfolioComponent {
  projectService = inject(ProjectService);
  projects = this.projectService.projects;
}
