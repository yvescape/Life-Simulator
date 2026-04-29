import type { GameEvent } from '../../types/event'

import childhoodRaw   from './childhood.json'
import teenagerRaw    from './teenager.json'
import youngAdultRaw  from './youngAdult.json'
import adultRaw       from './adult.json'
import seniorRaw      from './senior.json'

// Cast explicite : les JSON correspondent au type GameEvent
const childhood  = childhoodRaw  as GameEvent[]
const teenager   = teenagerRaw   as GameEvent[]
const youngAdult = youngAdultRaw as GameEvent[]
const adult      = adultRaw      as GameEvent[]
const senior     = seniorRaw     as GameEvent[]

/** Totalité des événements du jeu, toutes catégories confondues */
export const tousLesEvenements: GameEvent[] = [
  ...childhood,
  ...teenager,
  ...youngAdult,
  ...adult,
  ...senior,
]

/** Événements par tranche de vie, pour un accès ciblé si besoin */
export const evenementsPar = {
  enfance:       childhood,
  adolescence:   teenager,
  jeuneAdulte:   youngAdult,
  adulte:        adult,
  senior:        senior,
} as const
