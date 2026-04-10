import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildPrompt } from '@/lib/styles'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { characterDescription, styleId, referenceImages } = body

    // Aceita chave via header (sessionStorage do browser) ou env var
    const apiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não configurada. Acesse Configurações para inserir sua chave OpenAI.' },
        { status: 401 }
      )
    }

    if (!characterDescription || !styleId) {
      return NextResponse.json(
        { error: 'characterDescription e styleId são obrigatórios' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({ apiKey })
    const prompt = buildPrompt(styleId, characterDescription)

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: referenceImages?.length
        ? `${prompt} - Follow exactly the style shown in the reference images provided.`
        : prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high',
    })

    const imageData = response.data?.[0]
    const imageUrl = imageData?.url
    const imageB64 = imageData?.b64_json

    if (!imageUrl && !imageB64) {
      throw new Error('Nenhuma imagem retornada pela API')
    }

    return NextResponse.json({
      id: crypto.randomUUID(),
      imageUrl: imageUrl || `data:image/png;base64,${imageB64}`,
      prompt,
      styleId,
      characterDescription,
      createdAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Erro na geração:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
