import { Component, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Match, MatchingService, SEUIL_MATCHING } from '../services/matching';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.page.html',
  styleUrls: ['./matching.page.scss'],
  standalone: false,
})
export class MatchingPage {
  private matchingSer = inject(MatchingService);
  private authSer = inject(AuthService);
  private loadingCtrl = inject(LoadingController);

  matchs: Match[] = [];
  seuil = SEUIL_MATCHING;

  async ionViewWillEnter() {
    const loading = await this.loadingCtrl.create({ message: 'Recherche des correspondances...' });
    await loading.present();
    try {
      this.matchs = await this.matchingSer.getMatchs(this.authSer.currentUser!);
    } finally {
      await loading.dismiss();
    }
  }
}
