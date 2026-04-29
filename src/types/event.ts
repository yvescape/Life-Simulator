import type { CharacterStats } from './character'

// ─── Catégories d'événements ──────────────────────────────────────────────────

export type EventCategory = 'career' | 'family' | 'health' | 'finance' | 'random' | 'world'

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
  /** Modifications de la situation professionnelle */
  career?: {
    jobTitle?: string | null
    employer?: string | null
    salary?: number
    salaryDelta?: number
    satisfactionDelta?: number
    setUnemployed?: boolean
  }
  /** Variation des dettes (positif = nouvel emprunt, négatif = remboursement) */
  debtDelta?: number
  /** Événement à programmer pour un âge futur */
  scheduleEvent?: {
    eventId: string
    triggerAge: number
    type: EventCategory
  }
  /** Ajoute un tag mondial actif pendant N années */
  addWorldTag?: {
    tag: string
    label: string
    durationYears: number
  }
  /** Retire immédiatement un tag mondial (ex. fin de guerre après traité) */
  removeWorldTag?: string
}

// ─── Outcome (résultat variable) ──────────────────────────────────────────────

export interface Outcome {
  weight: number
  effects: ChoiceEffects
  valence?: 'positif' | 'negatif' | 'neutre'
  tagModifiers?: Record<string, number>
}

// ─── Choix proposé au joueur ──────────────────────────────────────────────────

export interface Choice {
  id: string
  label: string
  effects?: ChoiceEffects
  outcomes?: Outcome[]
  weight?: number
}

// ─── Événement de jeu ────────────────────────────────────────────────────────

export interface GameEvent {
  id: string
  category: EventCategory
  minAge: number
  maxAge: number
  requiredTags: string[]
  excludedTags: string[]
  weight: number
  text: string
  choices: Choice[]
  /**
   * Modificateurs additifs sur le poids de sélection de cet événement selon
   * les tags mondiaux actifs. Positif = plus probable, négatif = moins probable.
   * Ex. : { "pandemie_active": 30 } → événement plus fréquent en période de pandémie.
   */
  worldTagModifiers?: Record<string, number>
}
