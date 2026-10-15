import { Component, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { GestionFilms } from '../services/gestion-films';
import { FavorisService } from '../services/favoris';
import { AuthService } from '../services/auth';
import { Film } from '../models/film.model';

@Component({
  selector: 'app-films',
  templateUrl: './films.page.html',
  styleUrls: ['./films.page.scss'],
  standalone: false,
})
export class FilmsPage {
  private filmSer = inject(GestionFilms);
  private favorisSer = inject(FavorisService);
  private loadingCtrl = inject(LoadingController);
  authSer = inject(AuthService);

  tabFilms: Film[] = [];
  mesFavoris: string[] = [];
  recherche = '';

  // ionViewWillEnter (et non ngOnInit) : la page est gardée en cache par Ionic,
  // on recharge donc la liste à chaque retour sur la page
  async ionViewWillEnter() {
    const loading = await this.loadingCtrl.create({ message: 'Chargement des films...' });
    await loading.present();
    try {
      this.tabFilms = await this.filmSer.getAllFilms();
      this.mesFavoris = await this.favorisSer.getFavoris(this.authSer.currentUser!.id);
    } finally {
      await loading.dismiss();
    }
  }

  get filmsFiltres() {
    const q = this.recherche.trim().toLowerCase();
    return this.tabFilms.filter((film) => film.titre.toLowerCase().includes(q));
  }

  estFavori(film: Film) {
    return this.mesFavoris.includes(film.id);
  }
}
