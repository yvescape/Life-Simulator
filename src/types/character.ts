import type { Relationship } from './relationship'
export type { Relationship, RelationshipType } from './relationship'

// ─── Énumérations ────────────────────────────────────────────────────────────

export type Sexe = 'homme' | 'femme' | 'autre'

export type StatutVie = 'vivant' | 'mort'

export type NiveauEtude =
  | 'aucun'
  | 'primaire'
  | 'college'
  | 'lycee'
  | 'bac'
  | 'licence'
  | 'master'
  | 'doctorat'

export type StatutRelation =
  | 'celibataire'
  | 'en_couple'
  | 'marie'
  | 'divorce'
  | 'veuf'

// ─── Statistiques ─────────────────────────────────────────────────────────────

export interface CharacterStats {
  /** Points de forme physique, baisse avec l'âge et les mauvais choix (0–100) */
  santePhysique: number
  /** Équilibre émotionnel et psychologique (0–100) */
  santeMentale: number
  /** Capacité d'apprentissage et de raisonnement (0–100) */
  intelligence: number
  /** Aisance sociale et pouvoir de persuasion (0–100) */
  charisme: number
  /** Apparence physique perçue par les autres (0–100) */
  beaute: number
  /** Probabilité d'événements favorables (0–100) */
  chance: number
  /** Perception du personnage par la société (0–100) */
  reputation: number
}

// ─── Finances ─────────────────────────────────────────────────────────────────

export interface CharacterFinances {
  /** Solde disponible en euros */
  argent: number
  /** Revenu mensuel net (0 si sans emploi) */
  salaire: number
  /** Montant total des dettes en cours */
  dettes: number
}

// ─── Situation professionnelle ────────────────────────────────────────────────

export interface CareerStatus {
  /** Intitulé du poste actuel, null si sans emploi */
  jobTitle: string | null
  /** Salaire mensuel net en euros */
  salary: number
  /** Nom de l'employeur ou de l'entreprise */
  employer: string | null
  /** Satisfaction professionnelle (0–100) */
  satisfaction: number
  /** Nombre d'années dans le poste actuel (remis à 0 à chaque changement) */
  yearsInCurrentJob: number
}

// ─── Personnage ───────────────────────────────────────────────────────────────

export interface Character {
  /** UUID unique généré à la création */
  id: string
  prenom: string
  nom: string
  /** Âge actuel en années entières */
  age: number
  sexe: Sexe
  /** Pays de naissance / résidence (ex. 'France', 'Sénégal') */
  pays: string
  /** Date de naissance au format ISO (YYYY-MM-DD) */
  dateNaissance: string
  statut: StatutVie
  /** Cause du décès, null si toujours en vie */
  causeDeces: string | null

  stats: CharacterStats
  finances: CharacterFinances
  careerStatus: CareerStatus

  niveauEtude: NiveauEtude
  statutRelation: StatutRelation

  /** Liste des personnes avec qui le personnage a un lien */
  relations: Relationship[]

  /** Tags anti-répétition : mémorisent les événements déjà survenus */
  tags: CharacterTags
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

/**
 * Tableau de chaînes identifiant les événements déjà survenus.
 * Exemples : 'accident_voiture_survenu', 'premier_amour_vécu'
 * Permet au moteur d'éviter de rejouer un événement unique.
 */
export type CharacterTags = string[]

// ─── Événements ───────────────────────────────────────────────────────────────

export interface LifeEvent {
  /** Identifiant de l'événement (référence au fichier JSON source) */
  eventId: string
  /** Âge du personnage au moment de l'événement */
  age: number
  /** Texte narratif affiché au joueur */
  texte: string
  /** Clé du choix sélectionné par le joueur, null si événement sans choix */
  choixFait: string | null
  /** Description lisible des effets appliqués sur le personnage */
  consequences: string[]
}

export interface ScheduledEvent {
  /** Identifiant de l'événement à déclencher */
  eventId: string
  /** Âge exact auquel l'événement sera proposé */
  ageDeclencheur: number
  /** Type utilisé pour router vers le bon fichier JSON ('sante', 'famille', etc.) */
  type: string
  /** Données arbitraires transmises au moteur lors du déclenchement */
  donnees: Record<string, unknown>
}

// ─── Tags mondiaux ───────────────────────────────────────────────────────────

export interface WorldTag {
  /** Identifiant court utilisé dans requiredTags/excludedTags des événements */
  tag: string
  /** Libellé affiché dans l'UI (ex. "Pandémie mondiale") */
  label: string
  /** Première année civile où le tag n'est PLUS actif */
  expireAtYear: number
}

// ─── Bilan financier annuel ───────────────────────────────────────────────────

export interface FluxFinancier {
  /** Salaire annuel brut (careerStatus.salary × 12) */
  revenuAnnuel:   number
  /** Loyer + vie courante + famille (annualisé) */
  depensesFixes:  number
  /** Intérêts payés sur les dettes (5 % annuel) */
  interetsDettes: number
  /** Flux net = revenu − dépenses − intérêts (peut être négatif) */
  solde:          number
}

// ─── État global du jeu ───────────────────────────────────────────────────────

export interface GameState {
  /** Personnage actif (null avant la création d'une partie) */
  character: Character | null
  /** Chronologie complète des événements vécus, du plus ancien au plus récent */
  evenementsVecus: LifeEvent[]
  /** File d'événements futurs programmés par le moteur */
  evenementsProgrammes: ScheduledEvent[]
  /** Année civile correspondant à l'âge actuel du personnage */
  anneeCourante: number
  /** Indique si une partie est en cours */
  partieEnCours: boolean
  /** Compteur d'années consécutives avec santé mentale < 30 (stress chronique) */
  anneesStressEleve: number
  /** Résumé des flux financiers de la dernière année simulée */
  dernierBilan: FluxFinancier | null
  /** Tags mondiaux actifs (pandémie, crise, guerre…) avec leur date d'expiration */
  currentWorldTags: WorldTag[]
}
