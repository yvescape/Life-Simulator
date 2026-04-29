import type { GameEvent } from '../../types/event'

import childhoodRaw   from './childhood.json'
import teenagerRaw    from './teenager.json'
import youngAdultRaw  from './youngAdult.json'
import adultRaw       from './adult.json'
import seniorRaw      from './senior.json'
import scheduledRaw   from './scheduled.json'
import careerRaw      from './career.json'
import healthRaw      from './health.json'
import financeRaw     from './finance.json'
import worldRaw       from './world.json'

// Cast explicite : les JSON correspondent au type GameEvent
const childhood  = childhoodRaw  as GameEvent[]
const teenager   = teenagerRaw   as GameEvent[]
const youngAdult = youngAdultRaw as GameEvent[]
const adult      = adultRaw      as GameEvent[]
const senior     = seniorRaw     as GameEvent[]
const scheduled  = scheduledRaw  as GameEvent[]
const career     = careerRaw     as GameEvent[]
const health     = healthRaw     as GameEvent[]
const finance    = financeRaw    as GameEvent[]
const world      = worldRaw      as GameEvent[]

/** Totalité des événements du jeu, toutes catégories confondues */
export const tousLesEvenements: GameEvent[] = [
  ...childhood,
  ...teenager,
  ...youngAdult,
  ...adult,
  ...senior,
  ...scheduled,
  ...career,
  ...health,
  ...finance,
  ...world,
]

/** Événements par tranche de vie, pour un accès ciblé si besoin */
export const evenementsPar = {
  enfance:       childhood,
  adolescence:   teenager,
  jeuneAdulte:   youngAdult,
  adulte:        adult,
  senior:        senior,
  programmes:    scheduled,
  carriere:      career,
  sante:         health,
  finances:      finance,
  monde:         world,
} as const
