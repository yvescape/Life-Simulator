import type { Character, CharacterStats, CharacterFinances, LifeEvent, ScheduledEvent } from '../types/character'
import type { GameEvent, Choice, ChoiceEffects, Outcome, EventCategory } from '../types/event'

// ─── Interface des actions store passées en paramètre ─────────────────────────

export interface StoreActions {
  updateStats:    (p: Partial<CharacterStats>) => void
  updateFinances: (p: Partial<CharacterFinances>) => void
  addTag:         (t: string) => void
  removeTag:      (t: string) => void
  addLifeEvent:   (e: LifeEvent) => void
  scheduleEvent:  (s: ScheduledEvent) => void
}

// ─── Sélection d'un événement éligible ───────────────────────────────────────

export function pickNextEvent(character: Character, allEvents: GameEvent[]): GameEvent | null {
  const eligibles = allEvents.filter((evt) => {
    if (character.age < evt.minAge || character.age > evt.maxAge) return false
    if (evt.requiredTags.some((tag) => !character.tags.includes(tag))) return false
    if (evt.excludedTags.some((tag) => character.tags.includes(tag))) return false
    return true
  })

  if (eligibles.length === 0) return null

  const totalPoids = eligibles.reduce((acc, e) => acc + e.weight, 0)
  let tirage = Math.random() * totalPoids
  for (const evt of eligibles) {
    tirage -= evt.weight
    if (tirage <= 0) return evt
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

  return lignes
}

// ─── Application d'un choix au store ─────────────────────────────────────────

/**
 * Résout les effets, les applique au store et enregistre l'événement dans
 * l'historique. Retourne les lignes de conséquences lisibles.
 */
export function applyChoice(
  choice: Choice,
  event: GameEvent,
  character: Character,
  actions: StoreActions,
): string[] {
  const effects = resolveChoiceEffects(choice, character, event.category)
  if (!effects) return []

  if (effects.stats) actions.updateStats(effects.stats)

  if (effects.money !== undefined) {
    actions.updateFinances({ argent: character.finances.argent + effects.money })
  }

  effects.addTags?.forEach((tag) => actions.addTag(tag))
  effects.removeTags?.forEach((tag) => actions.removeTag(tag))

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

  return consequences
}
