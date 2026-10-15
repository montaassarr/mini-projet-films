import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddFilmPage } from './add-film.page';

const routes: Routes = [
  {
    path: '',
    component: AddFilmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddFilmPageRoutingModule {}
