import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { GestionFilms } from '../services/gestion-films';
import { FavorisService } from '../services/favoris';
import { AuthService } from '../services/auth';
import { Film } from '../models/film.model';

@Component({
  selector: 'app-film-details',
  templateUrl: './film-details.page.html',
  styleUrls: ['./film-details.page.scss'],
  standalone: false,
})
export class FilmDetailsPage {
  private actRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private filmSer = inject(GestionFilms);
  private favorisSer = inject(FavorisService);
  private authSer = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  selectedFilm?: Film;
  estFavori = false;

  async ngOnInit() {
    const id = this.actRoute.snapshot.paramMap.get('id') ?? '';
    const loading = await this.loadingCtrl.create({ message: 'Chargement...' });
    await loading.present();
    try {
      this.selectedFilm = await this.filmSer.getFilmById(id);
      const mesFavoris = await this.favorisSer.getFavoris(this.authSer.currentUser!.id);
      this.estFavori = mesFavoris.includes(id);
    } finally {
      await loading.dismiss();
    }

    if (!this.selectedFilm) {
      this.presentToast('Film introuvable', 'warning');
      this.router.navigateByUrl('/films');
    }
  }

  async toggleFavori() {
    const userId = this.authSer.currentUser!.id;
    const filmId = this.selectedFilm!.id;
    if (this.estFavori) {
      await this.favorisSer.retirer(userId, filmId);
      this.estFavori = false;
      this.presentToast('Film retiré de votre playlist', 'medium');
    } else {
      await this.favorisSer.ajouter(userId, filmId);
      this.estFavori = true;
      this.presentToast('Film ajouté à votre playlist', 'success');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
