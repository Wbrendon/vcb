'use client'

import { useState } from 'react'
import { useApiKey } from '@/lib/useApiKey'

export default function Settings() {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey()
  const [input, setInput] = useState('')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!input.trim()) return
    setApiKey(input.trim())
    setInput('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleClear() {
    clearApiKey()
    setInput('')
  }

  return (
    <div className="max-w-lg mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Configurações</h1>
        <p className="text-sm text-gray-400">
          Sua chave fica salva apenas nesta sessão do browser e some ao fechar a aba. Nunca é gravada no código ou enviada para nenhum servidor além da OpenAI.
        </p>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm ${
        hasKey
          ? 'bg-green-50 border border-green-100 text-green-700'
          : 'bg-amber-50 border border-amber-100 text-amber-700'
      }`}>
        <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-amber-400'}`} />
        {hasKey ? 'Chave configurada e ativa nesta sessão' : 'Nenhuma chave configurada'}
      </div>

      {/* Chave atual mascarada */}
      {hasKey && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-medium">Chave atual</p>
          <div className="flex items-center justify-between gap-3">
            <code className="text-sm text-gray-700 font-mono">
              {visible
                ? apiKey
                : apiKey.slice(0, 7) + '••••••••••••••••••••' + apiKey.slice(-4)}
            </code>
            <button
              onClick={() => setVisible(!visible)}
              className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
            >
              {visible ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
      )}

      {/* Input nova chave */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          {hasKey ? 'Substituir chave' : 'Inserir chave OpenAI'}
        </label>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-proj-..."
          className="border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:border-blue-400 placeholder:text-gray-300"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!input.trim()}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saved ? 'Salvo!' : 'Salvar chave'}
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-red-100 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-all"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-400 leading-relaxed">
        <p className="font-medium text-gray-500 mb-1">Como funciona</p>
        <p>A chave é armazenada em <code className="bg-gray-100 px-1 rounded">sessionStorage</code> — memória temporária do browser. Ela some automaticamente ao fechar a aba ou o browser. Nenhum dado é enviado ao GitHub, Vercel ou qualquer outro serviço além da OpenAI durante a geração.</p>
      </div>
    </div>
  )
}
