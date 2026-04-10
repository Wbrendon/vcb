'use client'

import { useState } from 'react'
import { useApiKey } from '@/lib/useApiKey'
import { GenerationResult } from '@/types'

const DEFAULT_PROMPT_JSON = {
  prompt_template: "A single {{character_description}} in a perfect 120-degree isometric view. The character is drawn in a refined, clean blue (#3C5BFF) outline vector style with accurate human proportions and subtle, believable posture. The figure should include historically or thematically appropriate clothing and props. The illustration must use smooth monochrome blue lines only, with no gradients, no shading, and absolutely no textures or noise. Background is pure white. The composition must be simple and centered, suitable for direct vector conversion (SVG) without cleanup.",
  style: {
    perspective: "Perfect 120-degree isometric",
    linework: {
      type: "Monochrome blue outline",
      stroke_weight: "Uniform",
      detail_level: "Minimal but expressive"
    },
    color: {
      primary: "Monochrome blue (#3C5BFF)",
      accents: "Optional, 1 color max (only if historically necessary)"
    },
    background: "Pure white",
    texture: "None",
    shading: "None",
    lighting: "None",
    noise: "None",
    anatomy: "Proportional human body with realistic stance and limb ratio",
    expression: "Neutral or subtle emotion",
    vector_ready: true
  },
  composition: {
    subject_focus: "One centered character",
    props: "Simple, relevant to role (e.g., scroll, sword, tool)",
    environment: "None or minimal (only if relevant to pose)",
    framing: "Character fully in-frame with balanced spacing",
    clutter: "None"
  },
  instructions_for_generation: "Never generate multiple characters. Always use single-subject, anatomically-correct human figure in isometric projection. Do not exaggerate features. No cartoonish effects. Prioritize geometry, balance, and vector cleanness."
}

function buildFinalPrompt(promptJson: typeof DEFAULT_PROMPT_JSON, characterDescription: string): string {
  return promptJson.prompt_template.replace('{{character_description}}', characterDescription)
}

export default function Generator() {
  const { apiKey, setApiKey, clearApiKey, hasKey, isLoaded } = useApiKey()
  const [characterDescription, setCharacterDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<GenerationResult[]>([])
  const [current, setCurrent] = useState<GenerationResult | null>(null)

  // Modal API key
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiInput, setApiInput] = useState('')
  const [apiSaved, setApiSaved] = useState(false)

  // Modal Prompt JSON (editável)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptJsonText, setPromptJsonText] = useState(JSON.stringify(DEFAULT_PROMPT_JSON, null, 2))
  const [promptJsonError, setPromptJsonError] = useState<string | null>(null)
  const [promptJsonSaved, setPromptJsonSaved] = useState(false)
  const [activePromptJson, setActivePromptJson] = useState(DEFAULT_PROMPT_JSON)

  const quickPrompts = [
    'warrior holding a sword',
    'scientist reading a scroll',
    'explorer with a backpack',
    'merchant with a scale',
    'engineer with blueprints',
    'doctor with a stethoscope',
  ]

  function handleSaveKey() {
    if (!apiInput.trim()) return
    setApiKey(apiInput.trim())
    setApiInput('')
    setApiSaved(true)
    setTimeout(() => { setApiSaved(false); setShowApiModal(false) }, 1200)
  }

  function handleSavePromptJson() {
    try {
      const parsed = JSON.parse(promptJsonText)
      if (!parsed.prompt_template || !parsed.prompt_template.includes('{{character_description}}')) {
        setPromptJsonError('O prompt_template precisa conter {{character_description}}')
        return
      }
      setActivePromptJson(parsed)
      setPromptJsonError(null)
      setPromptJsonSaved(true)
      setTimeout(() => { setPromptJsonSaved(false); setShowPromptModal(false) }, 1200)
    } catch {
      setPromptJsonError('JSON inválido. Verifique a formatação.')
    }
  }

  function handleResetPromptJson() {
    setPromptJsonText(JSON.stringify(DEFAULT_PROMPT_JSON, null, 2))
    setPromptJsonError(null)
  }

  async function handleGenerate() {
    if (!characterDescription.trim() || !hasKey) return
    setLoading(true)
    setError(null)
    try {
      const finalPrompt = buildFinalPrompt(activePromptJson, characterDescription)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-openai-key': apiKey },
        body: JSON.stringify({ prompt: finalPrompt, characterDescription }),
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

  const previewPrompt = characterDescription.trim()
    ? buildFinalPrompt(activePromptJson, characterDescription)
    : buildFinalPrompt(activePromptJson, '{{character_description}}')

  return (
    <div className="min-h-screen bg-white">

      {/* Modal API Key */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowApiModal(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Chave OpenAI</h2>
              <button onClick={() => setShowApiModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-lg">×</button>
            </div>
            {hasKey && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-700">Chave ativa nesta sessão</span>
                <button onClick={() => { clearApiKey(); setShowApiModal(false) }} className="ml-auto text-xs text-red-400 hover:text-red-600">Remover</button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <input type="password" value={apiInput} onChange={(e) => setApiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                placeholder="sk-proj-..." autoFocus
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400 placeholder:text-gray-300" />
              <button onClick={handleSaveKey} disabled={!apiInput.trim()}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all">
                {apiSaved ? 'Salvo!' : 'Salvar chave'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Salva em <code className="bg-gray-100 px-1 rounded">sessionStorage</code> — some ao fechar a aba.
            </p>
          </div>
        </div>
      )}

      {/* Modal Prompt JSON editável */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPromptModal(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Prompt de geração</h2>
                <p className="text-xs text-gray-400 mt-0.5">Edite o JSON diretamente. Use <code className="bg-gray-100 px-1 rounded">{"{{character_description}}"}</code> no prompt_template.</p>
              </div>
              <button onClick={() => setShowPromptModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-lg ml-4 shrink-0">×</button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              <textarea
                value={promptJsonText}
                onChange={(e) => { setPromptJsonText(e.target.value); setPromptJsonError(null) }}
                className="w-full h-80 font-mono text-xs border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:border-blue-400 bg-gray-50 text-gray-800 leading-relaxed"
                spellCheck={false}
              />
              {promptJsonError && (
                <p className="text-xs text-red-600 mt-2">{promptJsonError}</p>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-medium text-blue-700 mb-1">Preview do prompt final</p>
                <p className="text-xs text-blue-600 font-mono leading-relaxed break-words">{previewPrompt}</p>
              </div>
            </div>

            <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-gray-100">
              <button onClick={handleResetPromptJson}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 transition-all">
                Resetar padrão
              </button>
              <button onClick={handleSavePromptJson}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-all">
                {promptJsonSaved ? 'Salvo!' : 'Aplicar'}
              </button>
            </div>
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
          <button onClick={() => setShowPromptModal(true)}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all">
            Editar prompt
          </button>
          <button onClick={() => setShowApiModal(true)}
            className={`text-xs px-3 py-1.5 border rounded-lg transition-all flex items-center gap-1.5 ${
              hasKey ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                     : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-green-500' : 'bg-amber-400'}`} />
            {hasKey ? 'API ativa' : 'Configurar API'}
          </button>
        </div>
      </header>

      {isLoaded && !hasKey && (
        <div className="bg-amber-50 border-b border-amber-100 px-8 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-700">Configure sua chave OpenAI para começar.</p>
          <button onClick={() => setShowApiModal(true)} className="text-xs font-medium text-amber-700 underline underline-offset-2">
            Configurar agora
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-[360px_1fr] gap-10">
        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Descrição do personagem</p>
            <textarea value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)}
              placeholder="Ex: Viking scout holding telescope" rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-blue-400 placeholder:text-gray-300" />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => setCharacterDescription(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !characterDescription.trim() || !hasKey}
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {loading ? 'Gerando...' : !hasKey ? 'Configure a chave primeiro' : 'Gerar personagem'}
          </button>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Preview</p>
            <div className="border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center min-h-[480px]">
              {loading && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Gerando com GPT-4o...</p>
                </div>
              )}
              {!loading && current?.imageUrl && (
                <img src={current.imageUrl} alt={current.characterDescription}
                  className="max-h-[460px] max-w-full object-contain rounded-lg" />
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
                  <button onClick={handleDownload}
                    className="text-xs px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-all">
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
                  <button key={item.id} onClick={() => setCurrent(item)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      current?.id === item.id ? 'border-blue-600' : 'border-transparent hover:border-gray-200'}`}>
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
