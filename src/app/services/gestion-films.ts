import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Film } from '../models/film.model';

const DB_URL = environment.firebase.databaseURL;
const TMDB_URL = 'https://api.themoviedb.org/3/movie/popular';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

@Injectable({
  providedIn: 'root',
})
export class GestionFilms {
  private http = inject(HttpClient);

  async getAllFilms() {
    // Firebase renvoie un objet { id1: {...}, id2: {...} } : on le transforme en tableau
    const data = await firstValueFrom(this.http.get<any>(`${DB_URL}/films.json`));
    const films: Film[] = [];
    for (const id in data ?? {}) {
      films.push({ ...data[id], id });
    }
    return films;
  }

  async getFilmById(id: string) {
    const film = await firstValueFrom(this.http.get<Film | null>(`${DB_URL}/films/${id}.json`));
    return film ? { ...film, id } : undefined;
  }

  addFilm(newFilm: any) {
    // POST : Firebase génère lui-même l'identifiant
    return firstValueFrom(this.http.post(`${DB_URL}/films.json`, newFilm));
  }

  // Base de départ : on copie les films populaires de TMDB dans Firebase
  async importerDepuisTmdb() {
    const res: any = await firstValueFrom(
      this.http.get(`${TMDB_URL}?api_key=${environment.tmdbApiKey}&language=fr-FR&page=1`)
    );

    const films: any = {};
    for (const m of res.results) {
      // id fixe "tmdb_xxx" : réimporter ne crée pas de doublons
      films['tmdb_' + m.id] = {
        titre: m.title,
        resume: m.overview,
        annee: (m.release_date ?? '').substring(0, 4),
        affiche: m.poster_path ? TMDB_IMG + m.poster_path : '',
        note: m.vote_average,
      };
    }
    // PATCH : ajoute / met à jour ces films sans effacer les autres
    await firstValueFrom(this.http.patch(`${DB_URL}/films.json`, films));
    return res.results.length;
  }
}
