import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:';
const DB_URL = environment.firebase.databaseURL;
const SESSION_KEY = 'session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  currentUser: User | null = null;

  // La lecture de la session (Preferences) est asynchrone : on garde la promesse
  private ready: Promise<void>;

  constructor() {
    this.ready = this.restaurerSession();
  }

  whenReady() {
    return this.ready;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  async register(data: any) {
    try {
      // 1. Création du compte (email + mot de passe) dans Firebase Auth
      const res: any = await firstValueFrom(
        this.http.post(`${AUTH_URL}signUp?key=${environment.firebase.apiKey}`, {
          email: data.email,
          password: data.password,
          returnSecureToken: true,
        })
      );

      // 2. Enregistrement du profil dans la Realtime Database
      const user: User = {
        id: res.localId,
        nom: data.nom,
        prenom: data.prenom,
        age: +data.age,
        email: data.email,
        photo: data.photo,
        role: 'user',
        actif: true,
      };
      await firstValueFrom(this.http.put(`${DB_URL}/users/${user.id}.json`, user));

      await this.ouvrirSession(user);
      return user;
    } catch (err) {
      throw new Error(this.messageErreur(err));
    }
  }

  async login(email: string, password: string) {
    let res: any;
    try {
      res = await firstValueFrom(
        this.http.post(
          `${AUTH_URL}signInWithPassword?key=${environment.firebase.apiKey}`,
          { email, password, returnSecureToken: true }
        )
      );
    } catch (err) {
      throw new Error(this.messageErreur(err));
    }

    const user = await this.getProfil(res.localId);
    if (!user) {
      throw new Error('Profil introuvable');
    }
    if (!user.actif) {
      throw new Error("Votre compte a été désactivé par l'administrateur");
    }
    await this.ouvrirSession(user);
    return user;
  }

  async logout() {
    await Preferences.remove({ key: SESSION_KEY });
    this.currentUser = null;
  }

  private getProfil(id: string) {
    return firstValueFrom(this.http.get<User | null>(`${DB_URL}/users/${id}.json`));
  }

  private async ouvrirSession(user: User) {
    await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(user) });
    this.currentUser = user;
  }

  private async restaurerSession() {
    const { value } = await Preferences.get({ key: SESSION_KEY });
    if (!value) {
      return;
    }
    const saved: User = JSON.parse(value);
    try {
      // On relit le profil : l'admin a peut-être désactivé le compte entre-temps
      const user = await this.getProfil(saved.id);
      if (user && user.actif) {
        await this.ouvrirSession(user);
      } else {
        await this.logout();
      }
    } catch {
      this.currentUser = saved; // pas de réseau : on garde la session locale
    }
  }

  private messageErreur(err: any) {
    const code: string = err?.error?.error?.message ?? '';
    if (code.startsWith('EMAIL_EXISTS')) return 'Un compte existe déjà avec cet email';
    if (code.startsWith('WEAK_PASSWORD')) return 'Mot de passe trop faible (6 caractères minimum)';
    if (code.startsWith('INVALID_EMAIL')) return 'Email invalide';
    if (code.startsWith('INVALID_LOGIN_CREDENTIALS') || code.startsWith('EMAIL_NOT_FOUND') || code.startsWith('INVALID_PASSWORD'))
      return 'Email ou mot de passe incorrect';
    return 'Erreur de connexion au serveur';
  }
}
