import type { TableShape } from '@/types'

/**
 * Calcule les dimensions suggérées d'une table en fonction de sa capacité et sa forme.
 * Les tables rectangulaires s'allongent avec la capacité.
 * Les tables rondes grossissent avec la capacité.
 */
export function getTableDimensions(capacity: number, shape: TableShape): { width: number; height: number } {
  if (shape === 'CIRCLE') {
    const radius = Math.max(32, 24 + capacity * 7)
    return { width: radius * 2, height: radius * 2 }
  }

  if (shape === 'SQUARE') {
    const side = Math.max(60, 40 + capacity * 8)
    return { width: side, height: side }
  }

  // RECTANGLE — s'allonge sur l'axe X selon la capacité
  // hauteur fixe ~70px (2 chaises face à face), largeur proportionnelle
  const seatsPerSide = Math.ceil(capacity / 2)
  const width = Math.max(70, seatsPerSide * 38)
  const height = 70

  return { width, height }
}
