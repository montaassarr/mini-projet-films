// Modèle : "npm run setup" génère environment.ts et environment.prod.ts à partir de vos clés.
export const environment = {
  production: false,
  firebase: {
    apiKey: 'VOTRE_API_KEY_FIREBASE',
    databaseURL: 'https://VOTRE-PROJET-default-rtdb.europe-west1.firebasedatabase.app',
  },
  tmdbApiKey: 'VOTRE_CLE_TMDB',
};
