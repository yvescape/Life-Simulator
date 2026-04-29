import type { Character, CharacterStats, CharacterFinances, LifeEvent, ScheduledEvent } from '../types/character'
import type { GameEvent, Choice, ChoiceEffects } from '../types/event'

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

/**
 * Retourne un événement éligible tiré au sort selon le poids,
 * ou null si aucun événement ne correspond à l'âge et aux tags actuels.
 */
export function pickNextEvent(character: Character, allEvents: GameEvent[]): GameEvent | null {
  const eligibles = allEvents.filter((evt) => {
    if (character.age < evt.minAge || character.age > evt.maxAge) return false
    if (evt.requiredTags.some((tag) => !character.tags.includes(tag))) return false
    if (evt.excludedTags.some((tag) => character.tags.includes(tag))) return false
    return true
  })

  if (eligibles.length === 0) return null

  // Tirage pondéré
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
 * Applique tous les effets d'un choix sur le store et enregistre l'événement
 * dans l'historique. Retourne les lignes de conséquences lisibles.
 */
export function applyChoice(
  choice: Choice,
  event: GameEvent,
  character: Character,
  actions: StoreActions,
): string[] {
  const { effects } = choice

  if (effects.stats)   actions.updateStats(effects.stats)

  if (effects.money !== undefined) {
    actions.updateFinances({ argent: character.finances.argent + effects.money })
  }

  effects.addTags?.forEach((tag) => actions.addTag(tag))
  effects.removeTags?.forEach((tag) => actions.removeTag(tag))

  if (effects.scheduleEvent) {
    actions.scheduleEvent({
      eventId:         event.id,
      ageDeclencheur:  effects.scheduleEvent.triggerAge,
      type:            effects.scheduleEvent.type,
      donnees:         {},
    })
  }

  const consequences = genererConsequences(effects)

  actions.addLifeEvent({
    eventId:      event.id,
    age:          character.age,
    texte:        interpolerTexte(event.text, character),
    choixFait:    choice.id,
    consequences,
  })

  return consequences
}
