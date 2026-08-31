# Mada Customer Software

Suivi de la santé client et de la rentabilité : dates d'entrée, interactions, paiements, marge par produit et score de santé automatique.

## Development

You need Node.js — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase

---

## Fonctionnalités de l'application

### Gestion des clients (`/dashboard`)

- Créer, modifier, supprimer une fiche client (`src/components/clients/ClientForm.tsx`, `src/hooks/useClients.ts`).
- Fiche client organisée en 4 sections : **Identité** (nom, produit, secteur, SIRET, ancienneté, site internet, besoin réel), **Contact & présence** (téléphone, e-mail, adresse, siège social, Google My Business, réseaux sociaux), **Relation & paiements** (date d'entrée, dernière interaction, dernier paiement, prochain paiement dû) et **Économie du compte** (prix d'achat, coût de revient, charges).
- Recherche instantanée (`ClientSearchDialog.tsx`, raccourci accessible depuis l'en-tête) sur nom, produit, secteur, e-mail, téléphone, SIRET, avec **autocomplétion** : en tapant un début de mot déjà présent dans le portefeuille (nom, produit, secteur), une suggestion apparaît en grisé — `Tab` la valide.
- Tableau des clients (`ClientTable.tsx`), trié par score croissant par défaut, avec un sélecteur **« Trier par »** permettant de classer les clients selon chacune des 6 pondérations du score (voir [Calcul du score de santé](#calcul-du-score-de-santé)) ou par marge (du plus au moins rentable) ; un bouton inverse le sens du tri. Indicateur de retard de paiement, et détail du score au survol de la colonne « Score » (info-bulle native).
- Nuée de santé (`HealthSwarm.tsx`) : visualisation en essaim de points positionnés selon le score, avec ligne de seuil de risque et infobulle au survol détaillant le score poste par poste.
- Fiche client détaillée (`ClientDetailDialog.tsx`) : section **« Pourquoi ce score ? »** listant chacune des 6 pondérations et leur contribution en points.
- Export CSV / Excel personnalisable (`ClientExportDialog.tsx`, `AdminExportDialog.tsx`, `src/lib/adminExport.ts`) : choix des colonnes, export de la sélection ou de tout le portefeuille, avec KPI en feuille annexe.
- Limite de clients sur le plan gratuit (`src/lib/billing.ts`, `FREE_CLIENT_LIMIT = 30`), débloquée par le plan Pro ou pour un superadmin.

### Score de santé client

Le score est recalculé en continu à partir de la formule ci-dessous — voir [Calcul du score de santé](#calcul-du-score-de-santé).

### Formule personnalisable (`ScoreSettingsDialog.tsx`)

Chaque pondération et chaque seuil du score est réglable par l'utilisateur, par compte, et persisté dans la table `score_settings`.

### Équipe (`/team`)

- Un propriétaire de compte peut créer une équipe, inviter des membres par e-mail avec un rôle (**modérateur** ou **employé**), révoquer une invitation ou un membre (`src/lib/team.ts`, `src/lib/team.functions.ts`, `src/lib/team.server.ts`).
- Fonctionnalité réservée au plan Pro (`hasTeamAccess`).

### Facturation (`/pricing`, `/checkout`)

- Plan gratuit (jusqu'à 30 clients) et plan Pro (illimité + équipe), 10 €/mois (`PRO_PRICE_EUR`).
- Paiement et abonnement gérés via Stripe (webhook `src/routes/api/public/webhooks/stripe.ts`), statut d'abonnement stocké dans `subscriptions`.

### Espace superadmin (`/admin`)

- Réservé aux comptes ayant le rôle `superadmin` (table `user_roles`, fonction SQL `has_role`).
- Vue consolidée de **tous** les clients de **tous** les comptes, avec propriétaire, filtres (compte, statut, période, recherche texte) et statistiques globales (comptes, clients actifs, chiffre d'affaires, marge, score moyen).
- Changement manuel du plan d'un compte (bypass Stripe) et export CSV/Excel multi-comptes.

### Authentification & internationalisation

- Authentification par e-mail/mot de passe via Supabase Auth (`/auth`), e-mails transactionnels personnalisés (`supabase/templates/`).
- Application traduite en 7 langues : français, anglais, espagnol, allemand, russe, arabe, chinois (`src/i18n/locales/`).
- Thème clair/sombre (`ThemeToggle.tsx`), configurée en mode « web app » installable (icônes, écran de démarrage, zones de sécurité pour encoche/barre d'accueil).

### Sécurité des données

- Les champs sensibles d'un client (nom, SIRET, secteur, téléphone, e-mail, adresse, site internet, Google My Business) sont chiffrés au repos (AES-256-GCM, `src/lib/crypto.server.ts`) : seul le serveur peut les déchiffrer, jamais le navigateur.
- Row Level Security (RLS) sur toutes les tables Supabase : un utilisateur ne voit que ses propres clients, sauf le superadmin qui voit tout via une policy dédiée.
- Toutes les opérations sur les clients passent par des fonctions serveur (`src/lib/clients.functions.ts`, `src/lib/admin.functions.ts`) plutôt que par des appels directs depuis le navigateur.

### Pages légales

Mentions légales, CGU, CGV, politique de confidentialité et gestion des cookies (`/mentions-legales`, `/cgu`, `/cgv`, `/confidentialite`, `/cookies`), traduites dans les 7 langues (`src/lib/legal.ts`).

---

## Calcul du score de santé

Implémenté dans `computeMetrics()` — `src/lib/clients.ts`.

### Principe général

```
Score = 100 + Σ(points de chaque pondération)   [borné entre 5 et 99]
```

Chaque pondération ci-dessous retire ou ajoute des points. Toutes les valeurs numériques (jours, taux, pénalités, bonus) sont réglables par compte dans **Formule du score de santé** (`ScoreSettingsDialog.tsx` → table `score_settings`) ; les valeurs par défaut sont listées entre parenthèses.

### 1. Récence de la dernière interaction

- Pas d'interaction connue → pénalité fixe (**-25** pts, `interaction_missing_penalty`).
- Interaction dans les **14 derniers jours** (`interaction_grace_days`) → 0 point.
- Au-delà → -1 point tous les **3 jours** (`interaction_days_per_point`), plafonné à **-35** pts (`interaction_max_penalty`).

### 2. Tenue des paiements

- Si le prochain paiement dû (`next_payment_due`) est dépassé → -2 pts par jour de retard (`overdue_points_per_day`), plafonné à **-40** pts (`overdue_max_penalty`).
- Sinon, si aucun paiement n'a jamais été enregistré et que le client est là depuis plus de **30 jours** (`no_payment_after_days`) → pénalité fixe (**-15** pts, `no_payment_penalty`).

### 3. Rentabilité

La marge et le taux de marge sont calculés sur des montants **normalisés au mois** (voir [Fréquence de paiement](#fréquence-de-paiement-mensuel--paiement-unique) ci-dessous) :

```
margeMensuelle = prix_achat_mensuel − coût_revient_mensuel − charges_mensuelles
tauxMarge = margeMensuelle / prix_achat_mensuel   (0 si prix_achat_mensuel ≤ 0)
```

- Prix d'achat non renseigné ou nul → pénalité fixe (**-10** pts, `no_price_penalty`).
- Taux de marge ≥ **40 %** (`margin_good_rate`) → 0 point (marge saine).
- Taux de marge ≥ **20 %** (`margin_ok_rate`) → **-5** pts (`margin_ok_penalty`).
- Taux de marge ≥ 0 % → **-15** pts (`margin_low_penalty`).
- Taux de marge négatif → **-30** pts (`margin_negative_penalty`).

### 4. Fidélité

Client présent depuis plus de **365 jours** (`loyalty_days`) → bonus fixe (**+5** pts, `loyalty_bonus`).

### 5. Régularité du paiement (paiement mensuel)

Si le **prix d'achat** est réglé **mensuellement** → bonus fixe (**+5** pts, `monthly_payment_bonus`), sans effet sur le calcul des retards (pondération n°2, inchangée). Ce bonus est à double tranchant : un client mensuel part avec un score plus haut, mais un défaut de paiement le pénalise ensuite exactement comme n'importe quel client via la pondération « Tenue des paiements ».

### Seuils d'alerte

Le score détermine une tonalité (`scoreTone()`) utilisée dans les tableaux et graphiques :

- **`alarm`** (rouge) : score < **40** (`alarm_threshold`).
- **`warm`** (orange) : score < **55** (`risk_threshold`).
- **`ok`** (vert) : score ≥ **55**.

### Fréquence de paiement (mensuel / paiement unique)

Chacun des trois montants économiques (prix d'achat, coût de revient, charges) a sa propre fréquence, choisie dans la fiche client (`sale_price_frequency`, `cost_price_frequency`, `charges_frequency`, colonnes `text` en base) :

- **Mensuel** : le montant saisi est utilisé tel quel dans le calcul.
- **Paiement unique** : le montant est réparti sur **12 mois** (`ONE_TIME_SPREAD_MONTHS`, `monthlyEquivalent()` dans `src/lib/clients.ts`) avant d'entrer dans le calcul de marge/score. Un paiement unique de 1 200 € équivaut donc à 100 €/mois.

Le chiffre d'affaires affiché dans les tableaux de bord (KPI, statistiques superadmin) utilise le même équivalent mensuel, pour rester cohérent avec la marge affichée à côté.

### Répartition détaillée (`drivers`)

`computeMetrics()` retourne aussi le détail poste par poste (`ClientMetrics.drivers`) : une clé stable (`interaction` / `payments` / `profitability` / `loyalty` / `monthlyPayment`) et les points de chacune des 5 pondérations ci-dessus. Affiché à trois endroits (`src/components/clients/ScoreBreakdown.tsx`, réutilisé partout) :

- La fiche client (`ClientDetailDialog.tsx`), section « Pourquoi ce score ? ».
- L'infobulle de la nuée de santé (`HealthSwarm.tsx`) au survol d'un point.
- Le tableau des clients (`ClientTable.tsx`) : info-bulle native au survol de la colonne « Score », et sélecteur de tri permettant de classer le tableau selon n'importe laquelle des 6 pondérations (les 5 ci-dessus + le bonus paiement mensuel), ou selon la marge en euros (du plus au moins rentable).
