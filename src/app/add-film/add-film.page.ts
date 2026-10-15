import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { GestionFilms } from '../services/gestion-films';

@Component({
  selector: 'app-add-film',
  templateUrl: './add-film.page.html',
  styleUrls: ['./add-film.page.scss'],
  standalone: false,
})
export class AddFilmPage {
  private filmSer = inject(GestionFilms);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);

  async submitHandler(f: NgForm) {
    const loading = await this.loadingCtrl.create({ message: 'Enregistrement du film...' });
    await loading.present();
    try {
      await this.filmSer.addFilm(f.value);
      f.reset();
      this.presentToast('Film ajouté avec succès', 'success');
      this.navCtrl.navigateBack('/admin');
    } catch {
      this.presentToast("Erreur lors de l'ajout du film", 'danger');
    }
    await loading.dismiss();
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
