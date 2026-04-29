import type { CareerStatus } from '../types/character'

interface Props {
  careerStatus: CareerStatus
}

function couleurSatisfaction(val: number): string {
  if (val >= 70) return 'bg-emerald-500'
  if (val >= 40) return 'bg-yellow-500'
  return 'bg-rose-500'
}

export default function CareerPanel({ careerStatus }: Props) {
  const { jobTitle, employer, salary, satisfaction, yearsInCurrentJob } = careerStatus

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Carrière</h2>

      {jobTitle ? (
        <div className="flex flex-col gap-3">
          {/* Poste + employeur */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-white font-semibold">{jobTitle}</p>
              {employer && (
                <p className="text-slate-400 text-sm">{employer}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-emerald-400 font-bold">
                {salary.toLocaleString('fr-FR')} €
                <span className="text-slate-500 text-xs font-normal">/mois</span>
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {yearsInCurrentJob === 0
                  ? 'Nouveau poste'
                  : `${yearsInCurrentJob} an${yearsInCurrentJob > 1 ? 's' : ''} en poste`}
              </p>
            </div>
          </div>

          {/* Barre de satisfaction */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Satisfaction</span>
              <span>{satisfaction} / 100</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${couleurSatisfaction(satisfaction)}`}
                style={{ width: `${satisfaction}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-slate-400">
          <span className="text-2xl">💼</span>
          <span className="text-sm">Sans emploi</span>
        </div>
      )}
    </div>
  )
}
