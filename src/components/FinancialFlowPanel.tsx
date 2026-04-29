import type { FluxFinancier } from '../types/character'

interface Props {
  bilan: FluxFinancier
}

function Ligne({
  label,
  montant,
  positif,
}: {
  label: string
  montant: number
  positif: boolean
}) {
  const couleur = positif ? 'text-emerald-400' : 'text-rose-400'
  const signe   = positif ? '+' : '−'
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium tabular-nums ${couleur}`}>
        {signe} {Math.abs(montant).toLocaleString('fr-FR')} €
      </span>
    </div>
  )
}

export default function FinancialFlowPanel({ bilan }: Props) {
  const { revenuAnnuel, depensesFixes, interetsDettes, solde } = bilan
  const soldePositif = solde >= 0

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Bilan de l'année</h2>

      <div className="flex flex-col gap-2 mb-4">
        <Ligne label="Revenus annuels"   montant={revenuAnnuel}   positif={true} />
        <Ligne label="Dépenses fixes"    montant={depensesFixes}  positif={false} />
        {interetsDettes > 0 && (
          <Ligne label="Intérêts dettes" montant={interetsDettes} positif={false} />
        )}
      </div>

      <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
        <span className="text-slate-300 font-semibold">Flux net</span>
        <span
          className={`text-xl font-bold tabular-nums ${
            soldePositif ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {soldePositif ? '+' : '−'}{Math.abs(solde).toLocaleString('fr-FR')} €
        </span>
      </div>

      {!soldePositif && (
        <p className="text-rose-400/70 text-xs mt-2">
          Le déficit a été ajouté à vos dettes.
        </p>
      )}
    </div>
  )
}
