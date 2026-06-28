import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Define explicit prerendering parameters for our updated portfolio detail slugs
  {
    path: 'portfolio/:project-slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { 'project-slug': 'askalaps-iot' },
        { 'project-slug': 'diplomarbeit-lademanager' },
        { 'project-slug': 'harfenbau-reschenhofer' },
        { 'project-slug': 'makani-bowls' }
      ];
    }
  },
  
  // Default fallback for all other routes is Prerender (SSG)
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
