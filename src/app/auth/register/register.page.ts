import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { Photos } from '../../services/photos';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../auth.page.scss'],
  standalone: false,
})
export class RegisterPage {
  private authSer = inject(AuthService);
  private photoSer = inject(Photos);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);

  photo: string | undefined = '';

  async onPrendrePhoto() {
    try {
      this.photo = await this.photoSer.prendrePhoto();
    } catch {
      this.showAlert("Vous n'avez pas pris de photo");
    }
  }

  async onRegister(f: NgForm) {
    if (!this.photo) {
      this.showAlert('Veuillez prendre une photo avec la caméra');
      return;
    }
    if (+f.value.age <= 0) {
      this.showAlert('Veuillez saisir un âge valide');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Création du compte...' });
    await loading.present();
    try {
      const user = await this.authSer.register({ ...f.value, photo: this.photo });
      f.reset();
      this.photo = '';
      const toast = await this.toastCtrl.create({
        message: `Bienvenue ${user.prenom} !`,
        duration: 1500,
        position: 'top',
        color: 'success',
      });
      await toast.present();
      this.navCtrl.navigateRoot('/films');
    } catch (err) {
      this.showAlert((err as Error).message);
    }
    await loading.dismiss();
  }

  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erreur de saisie',
      message,
      buttons: ['Ok'],
    });
    await alert.present();
  }
}
