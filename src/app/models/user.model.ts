export interface User {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  email: string;
  photo: string; // photo prise avec la caméra (DataUrl)
  role: 'user' | 'admin';
  actif: boolean; // false = compte désactivé par l'admin
}
