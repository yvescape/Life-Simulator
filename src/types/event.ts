import type { CharacterStats } from './character'

// ─── Catégories d'événements ──────────────────────────────────────────────────

export type EventCategory = 'career' | 'family' | 'health' | 'finance' | 'random'

// ─── Effets d'un choix ────────────────────────────────────────────────────────

export interface ChoiceEffects {
  /** Modifications de stats — chaque valeur est un delta (peut être négatif) */
  stats?: Partial<CharacterStats>
  /** Gain ou perte d'argent en euros (négatif = perte) */
  money?: number
  /** Tags à ajouter sur le personnage après ce choix */
  addTags?: string[]
  /** Tags à retirer du personnage après ce choix */
  removeTags?: string[]
  /** Événement à programmer pour un âge futur */
  scheduleEvent?: {
    /** Âge auquel l'événement sera déclenché */
    triggerAge: number
    /** Catégorie servant au routage vers le bon fichier JSON */
    type: EventCategory
  }
}

// ─── Choix proposé au joueur ──────────────────────────────────────────────────

export interface Choice {
  /** Identifiant unique du choix dans l'événement */
  id: string
  /** Texte affiché sur le bouton */
  label: string
  effects: ChoiceEffects
  /**
   * Poids relatif pour les résultats aléatoires (1–100).
   * Utilisé quand plusieurs choix sont tirés au sort plutôt que présentés au joueur.
   */
  weight?: number
}

// ─── Événement de jeu ────────────────────────────────────────────────────────

export interface GameEvent {
  /** Identifiant unique, utilisé comme clé de tag anti-répétition */
  id: string
  category: EventCategory
  /** Âge minimum du personnage pour que l'événement soit éligible */
  minAge: number
  /** Âge maximum du personnage pour que l'événement soit éligible */
  maxAge: number
  /** Tags que le personnage doit posséder pour que l'événement soit éligible */
  requiredTags: string[]
  /** Tags qui rendent l'événement inéligible s'ils sont présents */
  excludedTags: string[]
  /**
   * Poids relatif pour la sélection aléatoire parmi les événements éligibles.
   * Plus la valeur est haute, plus l'événement est fréquent (1–100).
   */
  weight: number
  /**
   * Texte narratif affiché au joueur.
   * Supporte les variables : {prenom}, {age}, {ville}.
   */
  text: string
  choices: Choice[]
}
