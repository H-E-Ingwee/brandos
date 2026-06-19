'use client'

import { useState, useCallback } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export function useChat(module: string = 'general') {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queriesUsed, setQueriesUsed] = useState(0)
  const [queriesLimit, setQueriesLimit] = useState(10)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return

    const userMessage: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          module,
          history: messages.slice(-10), // send last 10 messages for context
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(`AI query limit reached. ${data.message}`)
        } else {
          setError(data.error || 'Failed to get response')
        }
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setQueriesUsed(data.queries_used)
      setQueriesLimit(data.queries_limit)

    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [messages, module, loading])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const addSystemMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content,
      timestamp: new Date(),
    }])
  }, [])

  return {
    messages,
    loading,
    error,
    queriesUsed,
    queriesLimit,
    sendMessage,
    clearMessages,
    addSystemMessage,
  }
}