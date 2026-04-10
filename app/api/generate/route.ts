import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, characterDescription } = body

    const apiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não configurada. Clique em "Configurar API" para inserir sua chave OpenAI.' },
        { status: 401 }
      )
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey })

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
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
      characterDescription,
      createdAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Erro na geração:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
