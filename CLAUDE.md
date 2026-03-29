# La Réserve — Guide de session Claude Code

## Contexte projet
Application de gestion de réservations pour restaurant (brasserie multi-salles).
Réécriture complète depuis un ancien projet Rails abandonné.

## Stack technique
| Couche | Techno |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS |
| Plan 2D | Konva.js via vue-konva |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Auth | JWT (Bearer token) |
| Package manager | pnpm (workspaces) |

## Structure du projet
```
la_reserve/
├── backend/          # NestJS API
│   ├── prisma/
│   │   └── schema.prisma   # Schéma complet de la BDD
│   └── src/
│       ├── auth/           # JWT register/login/me
│       ├── restaurants/    # Multi-resto par user
│       ├── rooms/          # Salles (multi-salle par resto)
│       ├── tables/         # Tables avec positions 2D (x,y,rotation,shape)
│       ├── bookings/       # Réservations complètes
│       ├── customers/      # Base clients + historique
│       ├── staff/          # Personnel avec couleur
│       ├── stats/          # Couverts par période/date
│       └── service-notes/  # Notes de service par jour
├── frontend/         # Vue 3
│   └── src/
│       ├── stores/         # Pinia (auth, restaurant, bookings, customers)
│       ├── router/         # Routes avec guard JWT
│       ├── views/          # Pages principales
│       ├── components/
│       │   ├── layout/     # AppLayout, AppSidebar, NavItem
│       │   ├── bookings/   # BookingModal, BookingRow, MiniCalendar
│       │   ├── floorplan/  # FloorPlanCanvas, TableShape (Konva)
│       │   ├── dashboard/  # ServiceBlock
│       │   ├── customers/  # CustomerDetail
│       │   └── stats/      # StatCard
│       └── types/          # Types TS + constantes (statuts, couleurs)
├── docker-compose.yml       # PostgreSQL + pgAdmin
└── package.json             # Root workspace pnpm
```

## Lancer le projet
```bash
# PostgreSQL
docker-compose up -d postgres

# Depuis la racine
pnpm install

# Backend (1er terminal)
cp backend/.env.example backend/.env   # seulement la 1ère fois
cd backend && pnpm prisma:migrate && pnpm dev

# Frontend (2ème terminal)
cd frontend && pnpm dev
```

URLs :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000/api
- pgAdmin : http://localhost:5050 (admin@lareserve.com / admin)

## Variables d'environnement backend
Fichier : `backend/.env` (copié depuis `.env.example`)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/la_reserve"
JWT_SECRET="change-this-in-production"
JWT_EXPIRES_IN="24h"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

## Modèle de données (résumé)
- **User** → plusieurs **Restaurant** (via RestaurantUser, rôles OWNER/MANAGER/STAFF)
- **Restaurant** → plusieurs **Room** (salles)
- **Room** → plusieurs **Table** (avec position x/y/rotation/shape pour le plan 2D)
- **Restaurant** → plusieurs **Booking** → appartient à un **Customer** + optionnellement un **Staff**
- **Booking** ↔ **Table** (many-to-many via BookingTable)
- **Booking** statuts : RESERVED → CONFIRMED → ARRIVED → SEATED → DONE | CANCELLED | NO_SHOW | WAITING

## Routes API principales
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/restaurants
POST   /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id

GET    /api/restaurants/:id/rooms
POST   /api/restaurants/:id/rooms

GET    /api/rooms/:id/tables
POST   /api/rooms/:id/tables
PUT    /api/rooms/:id/tables/bulk-positions   ← sauvegarde du plan 2D
PUT    /api/rooms/:id/tables/:tableId

GET    /api/restaurants/:id/bookings?date=YYYY-MM-DD&period=LUNCH|DINNER
POST   /api/restaurants/:id/bookings
PUT    /api/restaurants/:id/bookings/:bookingId

GET    /api/restaurants/:id/customers?search=...
POST   /api/restaurants/:id/customers

GET    /api/restaurants/:id/staff
POST   /api/restaurants/:id/staff

GET    /api/restaurants/:id/stats?from=YYYY-MM-DD&to=YYYY-MM-DD

GET    /api/restaurants/:id/service-notes?date=YYYY-MM-DD
POST   /api/restaurants/:id/service-notes
```

## État d'avancement

### ✅ Phase 0 — Fondations (terminée)
Toute la structure monorepo, schéma BDD, tous les modules backend, toutes les vues frontend.

### ✅ Correctifs post-Phase 0 (terminés)
- Nom de famille et email non obligatoires dans la prise de réservation
- Autocomplete client dans le modal réservation (recherche temps réel, clic pour pré-remplir)
- Sélection de table(s) directement dans le modal de réservation
- Taille des tables proportionnelle à la capacité (algo dans `frontend/src/utils/tableSize.ts`)

### 🔜 Phases suivantes (dans l'ordre)

#### Phase 1 — Plan de salle enrichi
- **Rotation des tables** — poignée de rotation sur table sélectionnée (Konva Transformer)
- **Dessin de la salle** — délimiter la forme de la salle en mode polygone (angles droits uniquement au début) ; les murs sont dessinés comme un polygone éditable point par point, stocké en JSON sur le modèle `Room` (`wallPolygon`)
- Redimensionnement des tables (Konva Transformer)
- Combinaison de tables (fusionner 2 tables adjacentes pour un grand groupe)

#### Phase 2 — Mode service live
- Plan 2D coloré par statut en temps réel
- Affectation rapide d'une réservation à une table par clic sur le plan
- Socket.io pour synchronisation multi-poste (plusieurs serveurs sur le même écran)

#### Phase 3 — Dashboard & notes de service
- Interface notes de service sur le dashboard
- Résumé VIP + liste d'attente en évidence

#### Phase 4 — Statistiques avancées
- Taux d'occupation par table
- Graphiques (couverts par semaine/mois)
- Export CSV/PDF

#### Phase 5 — Notifications email
- Confirmation réservation au client
- Rappel J-1

#### Phase 6 — Widget réservation public *(futur)*
- Formulaire embarquable sur site web du resto (iframe ou JS snippet)

## Conventions de code
- Tous les commentaires et labels UI en **français**
- Types partagés dans `frontend/src/types/index.ts`
- Toutes les routes backend protégées par `JwtAuthGuard` sauf `/auth/register` et `/auth/login`
- Le frontend utilise un proxy Vite `/api` → `localhost:3000` (pas de CORS en dev)
- Palette : slate (dark background) + amber/brand-500 (accent)

## Branche de travail
`claude/review-reservation-system-5QkWE`
