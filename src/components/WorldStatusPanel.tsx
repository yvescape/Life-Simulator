import type { WorldTag } from '../types/character'

interface Props {
  worldTags: WorldTag[]
  anneeCourante: number
}

const COULEURS: Record<string, string> = {
  pandemie_active:       'border-rose-500/60 bg-rose-900/20 text-rose-300',
  crise_economique_active:'border-amber-500/60 bg-amber-900/20 text-amber-300',
  guerre_regionale:      'border-red-500/60 bg-red-900/20 text-red-300',
  boom_tech_actif:       'border-cyan-500/60 bg-cyan-900/20 text-cyan-300',
  catastrophe_nat:       'border-orange-500/60 bg-orange-900/20 text-orange-300',
  inflation_active:      'border-yellow-500/60 bg-yellow-900/20 text-yellow-300',
}

const DEFAULT_COULEUR = 'border-slate-500/60 bg-slate-800/40 text-slate-300'

export default function WorldStatusPanel({ worldTags, anneeCourante }: Props) {
  if (worldTags.length === 0) return null

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-lg">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Contexte mondial
      </p>
      <div className="flex flex-col gap-2">
        {worldTags.map((wt) => {
          const anneesRestantes = wt.expireAtYear - anneeCourante
          const style = COULEURS[wt.tag] ?? DEFAULT_COULEUR
          return (
            <div
              key={wt.tag}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 ${style}`}
            >
              <span className="text-sm font-medium">{wt.label}</span>
              <span className="text-xs opacity-70 shrink-0 ml-2">
                {anneesRestantes <= 0
                  ? 'dernière année'
                  : `encore ${anneesRestantes} an${anneesRestantes > 1 ? 's' : ''}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
