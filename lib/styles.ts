import { CharacterStyle } from '@/types'

export const CHARACTER_STYLES: CharacterStyle[] = [
  {
    id: 'isometric-blue',
    name: 'Isométrico Azul',
    description: 'Estilo outline azul monocromático, vista isométrica 120°',
    promptTemplate: `A single {{character_description}} in a perfect 120-degree isometric view. The character is drawn in a refined, clean blue (#3C5BFF) outline vector style with accurate human proportions and subtle, believable posture. The figure should include historically or thematically appropriate clothing and props. The illustration must use smooth monochrome blue lines only, with no gradients, no shading, and absolutely no textures or noise. Background is pure white. The composition must be simple and centered, suitable for direct vector conversion (SVG) without cleanup.`,
    styleConfig: {
      perspective: 'Perfect 120-degree isometric',
      linework: {
        type: 'Monochrome blue outline',
        strokeWeight: 'Uniform',
        detailLevel: 'Minimal but expressive',
      },
      color: {
        primary: '#3C5BFF',
        accents: 'Optional, 1 color max',
      },
      background: 'Pure white',
      texture: 'None',
      shading: 'None',
      anatomy: 'Proportional human body with realistic stance and limb ratio',
      expression: 'Neutral or subtle emotion',
      vectorReady: true,
    },
  },
  {
    id: 'geometric-flat',
    name: 'Geométrico Flat',
    description: 'Formas geométricas simples, estilo flat minimalista',
    promptTemplate: `A single {{character_description}} character composed entirely of simple geometric shapes (rectangles, circles, triangles). Flat design style, no gradients, no shadows, no textures. Bold solid colors with clear outlines. Background is pure white. Minimal and expressive, vector-ready composition centered in frame.`,
    styleConfig: {
      perspective: 'Front-facing flat',
      linework: {
        type: 'Geometric shapes outline',
        strokeWeight: 'Bold uniform',
        detailLevel: 'Minimal geometric',
      },
      color: {
        primary: 'Bold solid colors',
        accents: '2-3 colors max',
      },
      background: 'Pure white',
      texture: 'None',
      shading: 'None',
      anatomy: 'Geometric abstraction of human form',
      expression: 'Simple geometric expression',
      vectorReady: true,
    },
  },
]

export function buildPrompt(styleId: string, characterDescription: string): string {
  const style = CHARACTER_STYLES.find((s) => s.id === styleId)
  if (!style) throw new Error(`Style ${styleId} not found`)
  return style.promptTemplate.replace('{{character_description}}', characterDescription)
}

export function getStyle(styleId: string): CharacterStyle | undefined {
  return CHARACTER_STYLES.find((s) => s.id === styleId)
}
