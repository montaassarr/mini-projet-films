import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.page.scss'],
  standalone: false,
})
export class LoginPage {
  private authSer = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private navCtrl = inject(NavController);

  async onLogin(f: NgForm) {
    const loading = await this.loadingCtrl.create({ message: 'Connexion...' });
    await loading.present();
    try {
      await this.authSer.login(f.value.email, f.value.password);
      f.reset();
      this.navCtrl.navigateRoot('/films');
    } catch (err) {
      this.showAlert((err as Error).message);
    }
    await loading.dismiss();
  }

  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erreur',
      message,
      buttons: ['Ok'],
    });
    await alert.present();
  }
}
