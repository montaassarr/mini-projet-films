export interface Film {
  id: string;
  titre: string;
  resume: string;
  annee: string;
  affiche: string; // URL de l'image
  note?: number;
}
