import { Component, inject } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { GestionUsers } from '../services/gestion-users';
import { GestionFilms } from '../services/gestion-films';
import { AuthService } from '../services/auth';
import { User } from '../models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {
  private usersSer = inject(GestionUsers);
  private filmSer = inject(GestionFilms);
  private authSer = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  tabUsers: User[] = [];

  async ionViewWillEnter() {
    const loading = await this.loadingCtrl.create({ message: 'Chargement des utilisateurs...' });
    await loading.present();
    try {
      const users = await this.usersSer.getAllUsers();
      // l'admin ne peut pas se désactiver lui-même
      this.tabUsers = users.filter((u) => u.id !== this.authSer.currentUser!.id);
    } finally {
      await loading.dismiss();
    }
  }

  async importerTmdb() {
    const loading = await this.loadingCtrl.create({ message: 'Import depuis TMDB...' });
    await loading.present();
    try {
      const nb = await this.filmSer.importerDepuisTmdb();
      this.presentToast(`${nb} films importés depuis TMDB`, 'success');
    } catch {
      this.presentToast("Échec de l'import (vérifiez la clé TMDB)", 'danger');
    }
    await loading.dismiss();
  }

  async changerStatut(user: User) {
    const action = user.actif ? 'désactiver' : 'réactiver';
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: `Voulez-vous ${action} le compte de ${user.prenom} ${user.nom} ?`,
      buttons: [
        'Annuler',
        {
          text: 'Oui',
          handler: async () => {
            await this.usersSer.setActif(user.id, !user.actif);
            user.actif = !user.actif;
            this.presentToast(`Compte ${user.actif ? 'réactivé' : 'désactivé'}`, user.actif ? 'success' : 'warning');
          },
        },
      ],
    });
    await alert.present();
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
