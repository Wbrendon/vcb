'use client'

import { useState } from 'react'
import { CHARACTER_STYLES, buildPrompt } from '@/lib/styles'
import { useApiKey } from '@/lib/useApiKey'
import { GenerationResult } from '@/types'

export default function Generator() {
  const { apiKey, setApiKey, clearApiKey, hasKey, isLoaded } = useApiKey()
  const [characterDescription, setCharacterDescription] = useState('')
  const [styleId, setStyleId] = useState('isometric-blue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<GenerationResult[]>([])
  const [current, setCurrent] = useState<GenerationResult | null>(null)

  // Modal API key
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiInput, setApiInput] = useState('')
  const [apiSaved, setApiSaved] = useState(false)

  // Prompt viewer
  const [showPrompt, setShowPrompt] = useState(false)

  const quickPrompts = [
    'warrior holding a sword',
    'scientist reading a scroll',
    'explorer with a backpack',
    'merchant with a scale',
    'engineer with blueprints',
    'doctor with a stethoscope',
  ]

  const currentPrompt = characterDescription.trim()
    ? buildPrompt(styleId, characterDescription)
    : null

  function handleSaveKey() {
    if (!apiInput.trim()) return
    setApiKey(apiInput.trim())
    setApiInput('')
    setApiSaved(true)
    setTimeout(() => {
      setApiSaved(false)
      setShowApiModal(false)
    }, 1200)
  }

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

      {/* Modal API Key */}
      {showApiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowApiModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Chave OpenAI</h2>
              <button
                onClick={() => setShowApiModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-lg leading-none"
              >
                ×
              </button>
            </div>

            {hasKey && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-700">Chave ativa nesta sessão</span>
                <button
                  onClick={() => { clearApiKey(); setShowApiModal(false) }}
                  className="ml-auto text-xs text-red-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={apiInput}
                onChange={(e) => setApiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                placeholder="sk-proj-..."
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-800 focus:outline-none focus:border-blue-400 placeholder:text-gray-300"
                autoFocus
              />
              <button
                onClick={handleSaveKey}
                disabled={!apiInput.trim()}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all"
              >
                {apiSaved ? 'Salvo!' : 'Salvar chave'}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              A chave fica em <code className="bg-gray-100 px-1 rounded">sessionStorage</code> e some ao fechar a aba. Nunca é gravada no código ou enviada para nenhum servidor além da OpenAI.
            </p>
          </div>
        </div>
      )}

      {/* Modal Prompt */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPrompt(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Prompt de geração</h2>
              <button
                onClick={() => setShowPrompt(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-wrap">
                {currentPrompt || 'Preencha a descrição do personagem para ver o prompt gerado.'}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Este prompt é montado automaticamente com base no estilo selecionado e na descrição do personagem. Para editar o template base acesse <code className="bg-gray-100 px-1 rounded">lib/styles.ts</code>.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">VCB Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrompt(true)}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
          >
            Ver prompt
          </button>
          <button
            onClick={() => setShowApiModal(true)}
            className={`text-xs px-3 py-1.5 border rounded-lg transition-all flex items-center gap-1.5 ${
              hasKey
                ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-green-500' : 'bg-amber-400'}`} />
            {hasKey ? 'API ativa' : 'Configurar API'}
          </button>
        </div>
      </header>

      {/* Banner sem chave */}
      {isLoaded && !hasKey && (
        <div className="bg-amber-50 border-b border-amber-100 px-8 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-700">Configure sua chave OpenAI para começar a gerar ilustrações.</p>
          <button
            onClick={() => setShowApiModal(true)}
            className="text-xs font-medium text-amber-700 underline underline-offset-2"
          >
            Configurar agora
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-[360px_1fr] gap-10">
        {/* Sidebar */}
        <div className="flex flex-col gap-6">
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
                    {hasKey ? 'Descreva o personagem e clique em gerar' : 'Configure sua chave OpenAI para começar'}
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
                    <img src={item.imageUrl} alt={item.characterDescription} className="w-full h-full object-cover" />
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
