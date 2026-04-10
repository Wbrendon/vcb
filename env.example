export interface CharacterStyle {
  id: string
  name: string
  description: string
  promptTemplate: string
  styleConfig: StyleConfig
  referenceImages?: string[]
}

export interface StyleConfig {
  perspective: string
  linework: {
    type: string
    strokeWeight: string
    detailLevel: string
  }
  color: {
    primary: string
    accents: string
  }
  background: string
  texture: string
  shading: string
  anatomy: string
  expression: string
  vectorReady: boolean
}

export interface GenerationRequest {
  characterDescription: string
  styleId: string
  referenceImages?: string[]
}

export interface GenerationResult {
  id: string
  prompt: string
  styleId: string
  imageUrl: string
  characterDescription: string
  createdAt: string
  status: 'pending' | 'completed' | 'error'
}

export interface GenerationHistory {
  items: GenerationResult[]
}
