import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddFilmPageRoutingModule } from './add-film-routing.module';

import { AddFilmPage } from './add-film.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFilmPageRoutingModule
  ],
  declarations: [AddFilmPage]
})
export class AddFilmPageModule {}
