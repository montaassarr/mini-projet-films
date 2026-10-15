import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const DB_URL = environment.firebase.databaseURL;

// Structure dans Firebase :  favoris / {idUser} / {idFilm} : true
@Injectable({
  providedIn: 'root',
})
export class FavorisService {
  private http = inject(HttpClient);

  async getFavoris(userId: string) {
    const data = await firstValueFrom(this.http.get<any>(`${DB_URL}/favoris/${userId}.json`));
    return Object.keys(data ?? {}); // tableau des id de films
  }

  // Favoris de tous les utilisateurs (pour le matching)
  async getTousLesFavoris() {
    const data = await firstValueFrom(this.http.get<any>(`${DB_URL}/favoris.json`));
    const result: { [userId: string]: string[] } = {};
    for (const userId in data ?? {}) {
      result[userId] = Object.keys(data[userId]);
    }
    return result;
  }

  ajouter(userId: string, filmId: string) {
    return firstValueFrom(this.http.put(`${DB_URL}/favoris/${userId}/${filmId}.json`, true));
  }

  retirer(userId: string, filmId: string) {
    return firstValueFrom(this.http.delete(`${DB_URL}/favoris/${userId}/${filmId}.json`));
  }
}
