import { inject, Injectable } from '@angular/core';
import { FavorisService } from './favoris';
import { GestionUsers } from './gestion-users';
import { User } from '../models/user.model';

export const SEUIL_MATCHING = 75; // en %

export interface Match {
  user: User;
  taux: number;
  communs: number;
}

@Injectable({
  providedIn: 'root',
})
export class MatchingService {
  private favorisSer = inject(FavorisService);
  private usersSer = inject(GestionUsers);

  /**
   * Taux de correspondance entre deux listes de favoris :
   *   taux = (films en commun / films différents des deux listes) x 100
   * Exemple : A = [1,2,3,4], B = [1,2,3,4,5] -> 4 communs / 5 au total = 80 %
   */
  calculerTaux(listeA: string[], listeB: string[]) {
    const communs = listeA.filter((id) => listeB.includes(id)).length;
    const total = new Set([...listeA, ...listeB]).size;
    return total === 0 ? 0 : Math.round((communs / total) * 100);
  }

  async getMatchs(moi: User) {
    const tousLesFavoris = await this.favorisSer.getTousLesFavoris();
    const users = await this.usersSer.getAllUsers();
    const mesFavoris = tousLesFavoris[moi.id] ?? [];

    const matchs: Match[] = [];
    for (const user of users) {
      if (user.id === moi.id || !user.actif) continue;

      const sesFavoris = tousLesFavoris[user.id] ?? [];
      const taux = this.calculerTaux(mesFavoris, sesFavoris);
      if (taux > SEUIL_MATCHING) {
        const communs = mesFavoris.filter((id) => sesFavoris.includes(id)).length;
        matchs.push({ user, taux, communs });
      }
    }
    // Les meilleurs matchs en premier
    return matchs.sort((a, b) => b.taux - a.taux);
  }
}
