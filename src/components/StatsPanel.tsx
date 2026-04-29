import type { CharacterStats } from '../types/character'

interface StatBarProps {
  label: string
  valeur: number
  couleur: string
}

function StatBar({ label, valeur, couleur }: StatBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold text-white">{valeur}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${couleur}`}
          style={{ width: `${valeur}%` }}
        />
      </div>
    </div>
  )
}

const CONFIG_STATS: { cle: keyof CharacterStats; label: string; couleur: string }[] = [
  { cle: 'santePhysique', label: 'Santé physique',  couleur: 'bg-emerald-500' },
  { cle: 'santeMentale',  label: 'Santé mentale',   couleur: 'bg-sky-500'     },
  { cle: 'intelligence',  label: 'Intelligence',    couleur: 'bg-violet-500'  },
  { cle: 'charisme',      label: 'Charisme',        couleur: 'bg-pink-500'    },
  { cle: 'beaute',        label: 'Beauté',          couleur: 'bg-rose-400'    },
  { cle: 'chance',        label: 'Chance',          couleur: 'bg-amber-400'   },
  { cle: 'reputation',    label: 'Réputation',      couleur: 'bg-indigo-400'  },
]

interface StatsPanelProps {
  stats: CharacterStats
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-200 mb-5">Statistiques</h2>
      <div className="flex flex-col gap-4">
        {CONFIG_STATS.map(({ cle, label, couleur }) => (
          <StatBar key={cle} label={label} valeur={stats[cle]} couleur={couleur} />
        ))}
      </div>
    </div>
  )
}
