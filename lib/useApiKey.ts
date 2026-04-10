'use client'

import { useState, useEffect } from 'react'

const SESSION_KEY = 'vcb_openai_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY) || ''
    setApiKeyState(stored)
    setIsLoaded(true)
  }, [])

  function setApiKey(key: string) {
    if (key) {
      sessionStorage.setItem(SESSION_KEY, key)
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
    setApiKeyState(key)
  }

  function clearApiKey() {
    sessionStorage.removeItem(SESSION_KEY)
    setApiKeyState('')
  }

  const hasKey = Boolean(apiKey)

  return { apiKey, setApiKey, clearApiKey, hasKey, isLoaded }
}
