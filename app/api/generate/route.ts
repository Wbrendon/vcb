import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, characterDescription, model = 'dall-e-3', quality = 'standard', size = '1024x1024' } = body

    const apiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key não configurada.' }, { status: 401 })
    if (!prompt) return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })

    const openai = new OpenAI({ apiKey })

    // gpt-image-1 usa API diferente internamente, cast para any para evitar conflito de tipos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.images.generate as any)({
      model,
      prompt,
      n: 1,
      size,
      ...(model !== 'dall-e-2' ? { quality } : {}),
    })

    const imageData = response.data?.[0]
    const imageUrl = imageData?.url
    const imageB64 = imageData?.b64_json

    if (!imageUrl && !imageB64) throw new Error('Nenhuma imagem retornada pela API')

    return NextResponse.json({
      id: crypto.randomUUID(),
      imageUrl: imageUrl || `data:image/png;base64,${imageB64}`,
      prompt,
      characterDescription,
      model,
      quality,
      size,
      createdAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Erro na geração:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
