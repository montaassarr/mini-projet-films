import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

const DB_URL = environment.firebase.databaseURL;

@Injectable({
  providedIn: 'root',
})
export class GestionUsers {
  private http = inject(HttpClient);

  async getAllUsers() {
    const data = await firstValueFrom(this.http.get<any>(`${DB_URL}/users.json`));
    const users: User[] = [];
    for (const id in data ?? {}) {
      users.push({ ...data[id], id });
    }
    return users;
  }

  // Désactiver / réactiver un compte (on ne supprime jamais l'utilisateur)
  setActif(userId: string, actif: boolean) {
    return firstValueFrom(this.http.patch(`${DB_URL}/users/${userId}.json`, { actif }));
  }
}
