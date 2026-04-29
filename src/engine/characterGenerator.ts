import type { Character, CharacterFinances, CharacterStats, Sexe } from '../types/character'
import { genererUUID, randomGaussian, randomPick } from '../utils/random'

// ─── Listes de prénoms ────────────────────────────────────────────────────────

const PRENOMS_HOMME = [
  'Alexandre', 'Antoine', 'Arthur', 'Baptiste', 'Benjamin',
  'Charles', 'Clément', 'Damien', 'David', 'Edouard',
  'Emile', 'Ethan', 'Florian', 'François', 'Gabriel',
  'Guillaume', 'Hugo', 'Julien', 'Kevin', 'Laurent',
  'Luc', 'Lucas', 'Mathieu', 'Mathis', 'Maxime',
  'Nicolas', 'Noel', 'Olivier', 'Paul', 'Philippe',
  'Pierre', 'Quentin', 'Raphael', 'Romain', 'Samuel',
  'Simon', 'Thomas', 'Théo', 'Timothée', 'Tom',
  'Tristan', 'Victor', 'Vincent', 'Xavier', 'Yann',
]

const PRENOMS_FEMME = [
  'Alice', 'Amelie', 'Anaïs', 'Aurélie', 'Axelle',
  'Camille', 'Charlotte', 'Chloé', 'Clara', 'Clémence',
  'Elisa', 'Elise', 'Emma', 'Eva', 'Inès',
  'Jade', 'Julie', 'Juliette', 'Laura', 'Laure',
  'Laurie', 'Lea', 'Lilou', 'Lisa', 'Louise',
  'Lucie', 'Luna', 'Manon', 'Marie', 'Marion',
  'Mathilde', 'Mélanie', 'Nina', 'Noemie', 'Océane',
  'Pauline', 'Sarah', 'Sofia', 'Sophie', 'Zoé',
]

const PRENOMS_AUTRE = [
  'Alexis', 'Andy', 'Ange', 'Bilal', 'Charlie',
  'Eden', 'Ely', 'Jesse', 'Jordan', 'Jules',
  'Kim', 'Leny', 'Lior', 'Lou', 'Luca',
  'Morgan', 'Nael', 'Noa', 'Nova', 'Remy',
  'Robin', 'Sacha', 'Sam', 'Sasha', 'Sidney',
  'Sky', 'Soan', 'Tao', 'Valentin', 'Yael',
]

// ─── Noms de famille ──────────────────────────────────────────────────────────

const NOMS = [
  'Bernard', 'Bertrand', 'Blanchard', 'Bonnet', 'Bouchard',
  'Boyer', 'Chevalier', 'Clement', 'Colin', 'David',
  'Denis', 'Dubois', 'Dumont', 'Dupont', 'Durand',
  'Faure', 'Fontaine', 'Fournier', 'Francois', 'Gaillard',
  'Garcia', 'Garnier', 'Gauthier', 'Girard', 'Giraud',
  'Guerin', 'Guillaume', 'Henry', 'Jacobs', 'Lacroix',
  'Laurent', 'Lecomte', 'Lefebvre', 'Legrand', 'Lemaire',
  'Lemoine', 'Leroux', 'Leroy', 'Lucas', 'Marie',
  'Martin', 'Masson', 'Mathieu', 'Mercier', 'Michel',
  'Moreau', 'Morel', 'Moulin', 'Muller', 'Noel',
  'Perrin', 'Petit', 'Philippe', 'Picard', 'Pierre',
  'Renard', 'Renaud', 'Richard', 'Robert', 'Robin',
  'Rodriguez', 'Roger', 'Roland', 'Rousseau', 'Roussel',
  'Roy', 'Simon', 'Thomas', 'Thomassin', 'Vincent',
]

// ─── Helpers internes ─────────────────────────────────────────────────────────

function choisirPrenom(sexe: Sexe): string {
  if (sexe === 'homme') return randomPick(PRENOMS_HOMME)
  if (sexe === 'femme') return randomPick(PRENOMS_FEMME)
  return randomPick(PRENOMS_AUTRE)
}

function genererStats(): CharacterStats {
  return {
    santePhysique: randomGaussian(30, 70),
    santeMentale:  randomGaussian(30, 70),
    intelligence:  randomGaussian(30, 70),
    charisme:      randomGaussian(30, 70),
    beaute:        randomGaussian(30, 70),
    chance:        randomGaussian(30, 70),
    reputation:    randomGaussian(30, 70),
  }
}

function genererFinances(): CharacterFinances {
  return {
    argent:  0,
    salaire: 0,
    dettes:  0,
  }
}

// ─── Générateur principal ─────────────────────────────────────────────────────

/**
 * Crée un personnage nouveau-né avec des attributs aléatoires.
 * L'année de naissance est l'année courante (partie commence à la naissance).
 */
export function generateRandomCharacter(): Character {
  const sexe = randomPick<Sexe>(['homme', 'femme', 'autre'])
  const prenom = choisirPrenom(sexe)
  const nom = randomPick(NOMS)
  const anneeNaissance = new Date().getFullYear()
  const dateNaissance = `${anneeNaissance}-01-01`

  return {
    id:            genererUUID(),
    prenom,
    nom,
    age:           0,
    sexe,
    pays:          'France',
    dateNaissance,
    statut:        'vivant',
    causeDeces:    null,

    stats:         genererStats(),
    finances:      genererFinances(),

    niveauEtude:   'aucun',
    careerStatus: {
      jobTitle:          null,
      salary:            0,
      employer:          null,
      satisfaction:      50,
      yearsInCurrentJob: 0,
    },
    statutRelation:'celibataire',
    relations:     [],
    tags:          [],
  }
}
