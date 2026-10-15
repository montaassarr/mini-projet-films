import { Component, inject } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { GestionFilms } from '../services/gestion-films';
import { FavorisService } from '../services/favoris';
import { AuthService } from '../services/auth';
import { Film } from '../models/film.model';

@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.page.html',
  styleUrls: ['./favoris.page.scss'],
  standalone: false,
})
export class FavorisPage {
  private filmSer = inject(GestionFilms);
  private favorisSer = inject(FavorisService);
  private authSer = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  mesFilms: Film[] = [];

  async ionViewWillEnter() {
    const loading = await this.loadingCtrl.create({ message: 'Chargement de la playlist...' });
    await loading.present();
    try {
      const films = await this.filmSer.getAllFilms();
      const ids = await this.favorisSer.getFavoris(this.authSer.currentUser!.id);
      this.mesFilms = films.filter((film) => ids.includes(film.id));
    } finally {
      await loading.dismiss();
    }
  }

  async retirer(film: Film) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: `Retirer "${film.titre}" de votre playlist ?`,
      buttons: [
        'Non',
        {
          text: 'Oui',
          handler: async () => {
            await this.favorisSer.retirer(this.authSer.currentUser!.id, film.id);
            this.mesFilms = this.mesFilms.filter((f) => f.id !== film.id);
          },
        },
      ],
    });
    await alert.present();
  }
}
