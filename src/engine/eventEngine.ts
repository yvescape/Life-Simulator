import type { Character, CharacterStats, CharacterFinances, CareerStatus, LifeEvent, ScheduledEvent, WorldTag } from '../types/character'
import type { GameEvent, Choice, ChoiceEffects, Outcome, EventCategory } from '../types/event'

// ─── Interface des actions store passées en paramètre ─────────────────────────

export interface StoreActions {
  updateStats:     (p: Partial<CharacterStats>) => void
  updateFinances:  (p: Partial<CharacterFinances>) => void
  updateCareer:    (p: Partial<CareerStatus>) => void
  addTag:          (t: string) => void
  removeTag:       (t: string) => void
  addLifeEvent:    (e: LifeEvent) => void
  scheduleEvent:   (s: ScheduledEvent) => void
  addWorldTag:     (w: { tag: string; label: string; durationYears: number }) => void
  removeWorldTag:  (tag: string) => void
}

// ─── Sélection d'un événement éligible ───────────────────────────────────────

export function pickNextEvent(
  character: Character,
  allEvents: GameEvent[],
  worldTags: string[] = [],
): GameEvent | null {
  // World tags sont injectés dans le pool de tags pour le filtrage
  const allTags = worldTags.length > 0 ? [...character.tags, ...worldTags] : character.tags

  const eligibles = allEvents.filter((evt) => {
    if (character.age < evt.minAge || character.age > evt.maxAge) return false
    if (evt.requiredTags.some((tag) => !allTags.includes(tag))) return false
    if (evt.excludedTags.some((tag) => allTags.includes(tag))) return false
    return true
  })

  if (eligibles.length === 0) return null

  // worldTagModifiers ajustent le poids de sélection de chaque événement
  const weights = eligibles.map((evt) => {
    let w = evt.weight
    if (evt.worldTagModifiers) {
      for (const [tag, delta] of Object.entries(evt.worldTagModifiers)) {
        if (worldTags.includes(tag)) w += delta
      }
    }
    return Math.max(1, w)
  })

  const totalPoids = weights.reduce((acc, w) => acc + w, 0)
  let tirage = Math.random() * totalPoids
  for (let i = 0; i < eligibles.length; i++) {
    tirage -= weights[i]
    if (tirage <= 0) return eligibles[i]
  }
  return eligibles[eligibles.length - 1]
}

// ─── Interpolation du texte ───────────────────────────────────────────────────

export function interpolerTexte(texte: string, character: Character): string {
  return texte
    .replace(/{prenom}/g, character.prenom)
    .replace(/{age}/g, String(character.age))
    .replace(/{ville}/g, character.pays)
}

// ─── Ajustement des poids d'outcomes selon les stats ─────────────────────────

/**
 * Retourne une copie des outcomes avec les poids ajustés selon les stats du
 * personnage et la catégorie de l'événement.
 *
 * Ordre d'application :
 *   1. Poids de base de l'outcome
 *   2. Modificateurs additifs par tag du personnage (tagModifiers)  → clamp ≥ 1
 *   3. Multiplicateur basé sur les stats (chance + stat secondaire) → clamp ≥ 1
 *
 * Formule du multiplicateur :
 *   bonus_chance     = (chance − 50) / 100          → [-0.5, +0.5]
 *   bonus_secondaire = (stat_catégorie − 50) / 200  → [-0.25, +0.25]
 *   bonus_total      ∈ [-0.75, +0.75]
 *
 *   positif → poids × max(0.1, 1 + bonus_total)
 *   négatif → poids × max(0.1, 1 − bonus_total)
 *   neutre  → poids inchangé
 */
export function modifyOutcomeWeights(
  outcomes: Outcome[],
  character: Character,
  category: EventCategory = 'random',
): Outcome[] {
  const bonusChance = (character.stats.chance - 50) / 100

  const STAT_SECONDAIRE: Record<EventCategory, keyof CharacterStats> = {
    career:  'intelligence',
    finance: 'intelligence',
    family:  'charisme',
    health:  'santePhysique',
    random:  'chance',
    world:   'chance',
  }
  const statCle = STAT_SECONDAIRE[category]
  const bonusSecondaire = (character.stats[statCle] - 50) / 200
  const bonusTotal = bonusChance + bonusSecondaire

  return outcomes.map((outcome) => {
    // Étape 1 : modificateurs additifs par tag
    let poids = outcome.weight
    if (outcome.tagModifiers) {
      for (const [tag, delta] of Object.entries(outcome.tagModifiers)) {
        if (character.tags.includes(tag)) poids += delta
      }
    }
    poids = Math.max(1, poids)

    // Étape 2 : multiplicateur basé sur les stats
    const valence = outcome.valence ?? 'neutre'
    let multiplicateur = 1
    if (valence === 'positif') multiplicateur = Math.max(0.1, 1 + bonusTotal)
    if (valence === 'negatif') multiplicateur = Math.max(0.1, 1 - bonusTotal)

    return { ...outcome, weight: Math.max(1, Math.round(poids * multiplicateur)) }
  })
}

// ─── Tirage pondéré d'un outcome ─────────────────────────────────────────────

function tirerOutcome(outcomes: Outcome[]): Outcome {
  const total = outcomes.reduce((acc, o) => acc + o.weight, 0)
  let tirage = Math.random() * total
  for (const outcome of outcomes) {
    tirage -= outcome.weight
    if (tirage <= 0) return outcome
  }
  return outcomes[outcomes.length - 1]
}

// ─── Résolution des effets d'un choix ────────────────────────────────────────

/**
 * Résout le choix du joueur en sélectionnant les effets à appliquer :
 * - Si le choix a `effects` direct, on l'utilise tel quel.
 * - Si le choix a `outcomes`, on ajuste les poids par les stats puis on tire
 *   un outcome au hasard.
 * Retourne les effets résolus, ou null si le choix est vide.
 */
export function resolveChoiceEffects(
  choice: Choice,
  character: Character,
  category: EventCategory,
): ChoiceEffects | null {
  if (choice.effects) return choice.effects

  if (choice.outcomes && choice.outcomes.length > 0) {
    const outcomesAjustes = modifyOutcomeWeights(choice.outcomes, character, category)
    return tirerOutcome(outcomesAjustes).effects
  }

  return null
}

// ─── Génération des lignes de conséquences ────────────────────────────────────

const LABELS_STATS: Record<keyof CharacterStats, string> = {
  santePhysique: 'Santé physique',
  santeMentale:  'Santé mentale',
  intelligence:  'Intelligence',
  charisme:      'Charisme',
  beaute:        'Beauté',
  chance:        'Chance',
  reputation:    'Réputation',
}

export function genererConsequences(effects: ChoiceEffects): string[] {
  const lignes: string[] = []

  if (effects.stats) {
    for (const [cle, val] of Object.entries(effects.stats)) {
      if (val === undefined || val === 0) continue
      const label = LABELS_STATS[cle as keyof CharacterStats] ?? cle
      lignes.push(`${val > 0 ? '+' : ''}${val} ${label}`)
    }
  }

  if (effects.money !== undefined && effects.money !== 0) {
    lignes.push(`${effects.money > 0 ? '+' : ''}${effects.money.toLocaleString('fr-FR')} €`)
  }

  if (effects.debtDelta !== undefined && effects.debtDelta !== 0) {
    if (effects.debtDelta > 0) {
      lignes.push(`+${effects.debtDelta.toLocaleString('fr-FR')} € de dettes`)
    } else {
      lignes.push(`${Math.abs(effects.debtDelta).toLocaleString('fr-FR')} € de dettes remboursées`)
    }
  }

  if (effects.addWorldTag) {
    lignes.push(`Événement mondial : ${effects.addWorldTag.label} (${effects.addWorldTag.durationYears} ans)`)
  }

  if (effects.career) {
    const c = effects.career
    if (c.setUnemployed)                    lignes.push('Perte d\'emploi')
    else if (c.jobTitle)                    lignes.push(`Nouveau poste : ${c.jobTitle}`)
    if (c.salary !== undefined && c.salary > 0)
      lignes.push(`Salaire : ${c.salary.toLocaleString('fr-FR')} €/mois`)
    else if (c.salaryDelta !== undefined && c.salaryDelta !== 0)
      lignes.push(`${c.salaryDelta > 0 ? '+' : ''}${c.salaryDelta.toLocaleString('fr-FR')} €/mois`)
    if (c.satisfactionDelta !== undefined && c.satisfactionDelta !== 0)
      lignes.push(`${c.satisfactionDelta > 0 ? '+' : ''}${c.satisfactionDelta} Satisfaction`)
  }

  return lignes
}

// ─── Application d'un choix au store ─────────────────────────────────────────

export interface ChoiceResult {
  /** Lignes de conséquences formatées pour l'affichage */
  consequences:      string[]
  /** Tags ajoutés au personnage par ce choix */
  addedTags:         string[]
  /** Tags retirés du personnage par ce choix */
  removedTags:       string[]
  /** Vrai si un événement a été programmé pour un âge futur */
  hasScheduledEvent: boolean
}

const VIDE: ChoiceResult = { consequences: [], addedTags: [], removedTags: [], hasScheduledEvent: false }

/**
 * Résout les effets, les applique au store et enregistre l'événement dans
 * l'historique. Retourne un ChoiceResult structuré pour l'affichage.
 */
export function applyChoice(
  choice: Choice,
  event: GameEvent,
  character: Character,
  actions: StoreActions,
): ChoiceResult {
  const effects = resolveChoiceEffects(choice, character, event.category)
  if (!effects) return VIDE

  if (effects.stats) actions.updateStats(effects.stats)

  if (effects.money !== undefined || effects.debtDelta !== undefined) {
    const newArgent = effects.money !== undefined
      ? character.finances.argent + effects.money
      : character.finances.argent
    const newDettes = effects.debtDelta !== undefined
      ? Math.max(0, character.finances.dettes + effects.debtDelta)
      : character.finances.dettes
    actions.updateFinances({ argent: newArgent, dettes: newDettes })
  }

  if (effects.career) {
    const c = effects.career
    const careerUpdates: Partial<CareerStatus> = {}
    if (c.setUnemployed) {
      careerUpdates.jobTitle          = null
      careerUpdates.employer          = null
      careerUpdates.salary            = 0
      careerUpdates.satisfaction      = 20
      careerUpdates.yearsInCurrentJob = 0
    } else {
      if (c.jobTitle !== undefined) {
        careerUpdates.jobTitle          = c.jobTitle
        careerUpdates.yearsInCurrentJob = 0
      }
      if (c.employer !== undefined) careerUpdates.employer = c.employer
      if (c.salary    !== undefined) careerUpdates.salary  = c.salary
      else if (c.salaryDelta !== undefined) {
        careerUpdates.salary = Math.max(0, character.careerStatus.salary + c.salaryDelta)
      }
      if (c.satisfactionDelta !== undefined) {
        careerUpdates.satisfaction = Math.min(
          100, Math.max(0, character.careerStatus.satisfaction + c.satisfactionDelta),
        )
      }
    }
    if (Object.keys(careerUpdates).length > 0) actions.updateCareer(careerUpdates)
  }

  effects.addTags?.forEach((tag) => actions.addTag(tag))
  effects.removeTags?.forEach((tag) => actions.removeTag(tag))

  if (effects.addWorldTag)   actions.addWorldTag(effects.addWorldTag)
  if (effects.removeWorldTag) actions.removeWorldTag(effects.removeWorldTag)

  if (effects.scheduleEvent) {
    actions.scheduleEvent({
      eventId:        effects.scheduleEvent.eventId,
      ageDeclencheur: character.age + effects.scheduleEvent.triggerAge,
      type:           effects.scheduleEvent.type,
      donnees:        {},
    })
  }

  const consequences = genererConsequences(effects)

  actions.addLifeEvent({
    eventId:     event.id,
    age:         character.age,
    texte:       interpolerTexte(event.text, character),
    choixFait:   choice.id,
    consequences,
  })

  return {
    consequences,
    addedTags:         effects.addTags     ?? [],
    removedTags:       effects.removeTags  ?? [],
    hasScheduledEvent: !!effects.scheduleEvent,
  }
}
