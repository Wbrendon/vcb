'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CHARACTER_STYLES } from '@/lib/styles'
import { useApiKey } from '@/lib/useApiKey'
import { GenerationResult } from '@/types'

export default function Generator() {
  const { apiKey, hasKey, isLoaded } = useApiKey()
  const [characterDescription, setCharacterDescription] = useState('')
  const [styleId, setStyleId] = useState('isometric-blue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<GenerationResult[]>([])
  const [current, setCurrent] = useState<GenerationResult | null>(null)

  const quickPrompts = [
    'warrior holding a sword',
    'scientist reading a scroll',
    'explorer with a backpack',
    'merchant with a scale',
    'engineer with blueprints',
    'doctor with a stethoscope',
  ]

  async function handleGenerate() {
    if (!characterDescription.trim() || !hasKey) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openai-key': apiKey,
        },
        body: JSON.stringify({ characterDescription, styleId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na geração')

      const result: GenerationResult = { ...data, status: 'completed' }
      setCurrent(result)
      setHistory((prev) => [result, ...prev].slice(0, 12))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!current?.imageUrl) return
    const a = document.createElement('a')
    a.href = current.imageUrl
    a.download = `vcb-${current.characterDescription.replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">VCB Studio</span>
        </div>
        <div className="flex items-center gap-4">
          {isLoaded && (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="text-xs text-gray-400">{hasKey ? 'API ativa' : 'Sem chave'}</span>
            </div>
          )}
          <Link
            href="/settings"
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
          >
            Configurações
          </Link>
        </div>
      </header>

      {/* Banner sem chave */}
      {isLoaded && !hasKey && (
        <div className="bg-amber-50 border-b border-amber-100 px-8 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-700">
            Configure sua chave OpenAI para começar a gerar ilustrações.
          </p>
          <Link
            href="/settings"
            className="text-xs font-medium text-amber-700 underline underline-offset-2"
          >
            Configurar agora
          </Link>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-[360px_1fr] gap-10">
        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Style selector */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Estilo</p>
            <div className="flex flex-col gap-2">
              {CHARACTER_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setStyleId(style.id)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    styleId === style.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">{style.name}</p>
                  <p className="text-xs mt-0.5 opacity-70">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
              Descrição do personagem
            </p>
            <textarea
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
              placeholder="Ex: Viking scout holding telescope"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-blue-400 placeholder:text-gray-300"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setCharacterDescription(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !characterDescription.trim() || !hasKey}
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Gerando...' : !hasKey ? 'Configure a chave primeiro' : 'Gerar personagem'}
          </button>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Preview</p>
            <div className="border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center min-h-[480px] relative">
              {loading && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Gerando com GPT-4o...</p>
                </div>
              )}
              {!loading && current?.imageUrl && (
                <img
                  src={current.imageUrl}
                  alt={current.characterDescription}
                  className="max-h-[460px] max-w-full object-contain rounded-lg"
                />
              )}
              {!loading && !current && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">✦</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {hasKey
                      ? 'Descreva o personagem e clique em gerar'
                      : 'Configure sua chave OpenAI para começar'}
                  </p>
                </div>
              )}
            </div>

            {current && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400 truncate max-w-sm">{current.characterDescription}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="text-xs px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-all"
                  >
                    Download PNG
                  </button>
                  <span className="text-xs px-4 py-2 border border-blue-100 rounded-lg text-blue-500 bg-blue-50">
                    Vetorizar no Figma →
                  </span>
                </div>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Histórico</p>
              <div className="grid grid-cols-6 gap-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrent(item)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      current?.id === item.id ? 'border-blue-600' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.characterDescription}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
