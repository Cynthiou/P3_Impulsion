Impulsion

Ton carnet d'entraînement. Une application web mobile pour préparer sa séance de musculation, la suivre en direct à la salle et retrouver son historique.

🔗 Voir l'application en ligne (créer un compte pour l'essayer)

Le projet

Projet de titre Développeur Web et Web Mobile (Wild Code School, promo 2026), réalisé à trois développeurs en deux mois (août à octobre 2026).

Pour une séance de musculation, il faut savoir quels exercices faire et comment, gérer ses temps de repos et noter ses charges. Impulsion réunit tout au même endroit, et a été pensée pour s'utiliser à la salle, d'une main, entre deux séries.

Fonctionnalités
Catalogue de 151 exercices en français, avec photo, étapes d'exécution et muscles travaillés, filtres (groupe, matériel, difficulté), recherche et pagination
Préparer une séance : choisir ses exercices, les ordonner, régler les séries et le temps de repos
Séance en direct : chrono, validation des séries, minuteur de repos qui se lance tout seul
Récapitulatif avant d'enregistrer (durée, séries, volume total)
Historique rangé par mois, avec le détail de chaque séance
Compte utilisateur sécurisé, thème sombre et clair
Stack technique
Front	Back	Base de données	Outils
React, TypeScript, Vite, Tailwind CSS, daisyUI	Node.js, Express	MySQL	Git / GitHub, Biome, Vitest, Jest, Supertest, Docker, Railway

Authentification par JWT stocké en cookie, mots de passe hachés avec Argon2, requêtes SQL préparées.

Ma contribution
Conception : maquettes (wireframes) de l'application, schéma de base de données conçu avec mon propre outil de modélisation
Identité visuelle : catalogue d'exercices traduit en français, icônes de muscles dessinées sur Illustrator
Développement front et back de plusieurs parcours :
préparer une séance (US11) et démarrer une séance (US16)
valider (US21) et abandonner une séance (US22)
historique (US23) et détail d'une séance passée (US24)
page d'accueil (US39), pagination des listes (US26), filtres repliables du catalogue (US09)
Équipe

Cynthia · Yannick · Fabian

Lancer le projet en local
bash
npm install
# copier server/.env.sample en server/.env et client/.env.sample en client/.env, puis les remplir
npm run db:migrate
npm run dev
Crédits

Catalogue d'exercices adapté du projet Exercise API de Marc Mayol, traduit et enrichi par l'équipe.