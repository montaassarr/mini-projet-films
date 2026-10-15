import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'films',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthPageModule),
  },
  {
    path: 'films',
    canActivate: [authGuard],
    loadChildren: () => import('./films/films.module').then((m) => m.FilmsPageModule),
  },
  {
    path: 'film-details/:id',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./film-details/film-details.module').then((m) => m.FilmDetailsPageModule),
  },
  {
    path: 'favoris',
    canActivate: [authGuard],
    loadChildren: () => import('./favoris/favoris.module').then((m) => m.FavorisPageModule),
  },
  {
    path: 'matching',
    canActivate: [authGuard],
    loadChildren: () => import('./matching/matching.module').then((m) => m.MatchingPageModule),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminPageModule),
  },
  {
    path: 'add-film',
    canActivate: [adminGuard],
    loadChildren: () => import('./add-film/add-film.module').then((m) => m.AddFilmPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
