import { Component, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  authSer = inject(AuthService);
  private navCtrl = inject(NavController);

  async onLogout() {
    await this.authSer.logout();
    this.navCtrl.navigateRoot('/auth/login');
  }
}
