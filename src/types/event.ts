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
    /** Identifiant de l'événement cible dans le pool (fichiers JSON) */
    eventId: string
    /** Délai en années depuis l'âge actuel du personnage (offset relatif) */
    triggerAge: number
    /** Catégorie de l'événement cible */
    type: EventCategory
  }
}

// ─── Outcome (résultat variable) ──────────────────────────────────────────────

export interface Outcome {
  /** Poids brut avant tout ajustement (1–100) */
  weight: number
  effects: ChoiceEffects
  /**
   * Nature de l'outcome, détermine comment les stats du personnage
   * font varier sa probabilité :
   * - 'positif' : favorisé par une chance / stat pertinente élevée
   * - 'negatif' : défavorisé par une chance / stat pertinente élevée
   * - 'neutre'  : non modifié par les stats (défaut si absent)
   */
  valence?: 'positif' | 'negatif' | 'neutre'
  /**
   * Modificateurs additifs par tag du personnage.
   * Appliqués au poids de base AVANT le multiplicateur de stats.
   * Valeur positive = outcome plus probable si le personnage a ce tag.
   * Valeur négative = outcome moins probable.
   *
   * Exemple : { 'travailleur_acharné': 25, 'burnout_vecu': -15 }
   */
  tagModifiers?: Record<string, number>
}

// ─── Choix proposé au joueur ──────────────────────────────────────────────────

export interface Choice {
  /** Identifiant unique du choix dans l'événement */
  id: string
  /** Texte affiché sur le bouton */
  label: string
  /**
   * Résultat direct, appliqué systématiquement.
   * Exclusif avec `outcomes` : utiliser l'un ou l'autre, pas les deux.
   */
  effects?: ChoiceEffects
  /**
   * Résultats variables : un seul outcome est tiré au sort, pondéré par
   * les weights et ajusté selon les stats du personnage.
   * Exclusif avec `effects`.
   */
  outcomes?: Outcome[]
  /**
   * Poids relatif pour les choix tirés au sort plutôt que présentés au joueur.
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
