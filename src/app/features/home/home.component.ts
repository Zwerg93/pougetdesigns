import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  projectService = inject(ProjectService);
  
  // Expose projects via a computed property or direct signal access
  projects = this.projectService.projects;
}
