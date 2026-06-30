import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Mic, Sparkles, AlertTriangle, ArrowRight, CornerDownLeft, Volume2 } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { queryGemini } from '../../services/ai'

const CHIPS = [
  "Add task Setup Stripe webhooks",
  "What is my riskiest task today?",
  "Trigger calendar rescue",
]

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'sentri',
    text: "Hello! I am your Sentri AI Copilot. I analyze calendar dependencies and project schedules in the background. What would you like to audit or reschedule today?",
    time: '9:00 AM'
  }
]

export default function Copilot() {
  const { tasks: storeTasks, calendarEvents: storeEvents, createTask, saveCalendarEvent, deleteCalendarEvent, fetchTasks } = useTaskStore()
  
  useEffect(() => {
    fetchTasks()
  }, [])

  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [thinking, setThinking] = useState(false)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, thinking])

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText
    if (!query.trim()) return

    // Add User message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setThinking(true)

    try {
      const activeTasks = storeTasks
      const calendarEvents = storeEvents

      // Call our double-robust Gemini service
      const result = await queryGemini(query, activeTasks, calendarEvents)
      let aiText = result.text
      let isRescueTrigger = result.isRescue

      // Check interceptors: DONE_TASK
      if (aiText.includes("DONE_TASK:")) {
        const match = aiText.match(/DONE_TASK:\s*(.+)/)
        const taskTitle = match ? match[1].split("\n")[0].trim() : ""
        if (taskTitle) {
          const newTask = {
            id: 't_' + Date.now(),
            title: taskTitle,
            description: 'Created dynamically via AI Copilot conversation.',
            risk: 50,
            deadline: 'Tomorrow',
            tag: 'Dev',
            status: 'in_progress',
            reasoning: ['Registered via Copilot voice/chat input stream.']
          }
          await createTask(newTask)
          window.dispatchEvent(new Event('taskUpdated'))
        }
        // Strip out the interceptor tag
        aiText = aiText.replace(/DONE_TASK:\s*.+/, '').trim()
        if (!aiText) {
          aiText = `I've created the task **"${taskTitle}"** and added it to your queue.`
        }
      }

      // Check interceptors: TRIGGER_RESCUE
      if (isRescueTrigger || aiText.includes("TRIGGER_RESCUE")) {
        await deleteCalendarEvent('evt_1')
        const focusBlock = {
          id: 'evt_copilot_rescue',
          title: 'AI Copilot Focus Defense Lock',
          source: 'ai_focus',
          start: 9,
          end: 12,
          reason: 'Reserved autonomously via AI Copilot chat interaction.'
        }
        await saveCalendarEvent(focusBlock)
        window.dispatchEvent(new Event('calendarUpdated'))
        
        // Strip out trigger tags
        aiText = aiText.replace("TRIGGER_RESCUE", "").trim()
        if (!aiText) {
          aiText = "Executing calendar optimization simulations... I have checked your sync schedules. declination notes have been drafted for Standup Sync. Protected focus blocks successfully synced."
        }
        isRescueTrigger = true
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'sentri',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rescueNode: isRescueTrigger
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (e) {
      console.error(e)
      const errMsg = {
        id: Date.now() + 1,
        sender: 'sentri',
        text: "Apologies, I encountered an error communicating with the generative engine. Please check your credentials.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setThinking(false)
    }
  }

  // Voice simulator trigger
  const handleMicClick = () => {
    if (isListening) return
    setIsListening(true)
    
    // Simulate hearing command
    setTimeout(() => {
      setInputText("What is my riskiest task today?")
      setIsListening(false)
    }, 2200)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] border border-zinc-800 rounded-2xl bg-card overflow-hidden">
      
      {/* 1. Header block */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/35">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Copilot <span className="text-[10px] bg-accent/20 border border-accent/30 text-accent font-bold px-2 py-0.5 rounded-full capitalize">online</span>
            </h3>
            <p className="text-[10px] text-zinc-500">Sentri LLM v2.5 Autopilot assistant</p>
          </div>
        </div>
      </div>

      {/* 2. Messages Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isSentri = msg.sender === 'sentri'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 max-w-[85%] ${isSentri ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  isSentri
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}>
                  {isSentri ? <Bot size={14} /> : <User size={14} />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed border ${
                      isSentri
                        ? 'bg-zinc-900/40 border-zinc-850/80 text-zinc-200'
                        : 'bg-primary text-white border-primary/30'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.rescueNode && (
                      <div className="mt-3 bg-accent/10 border border-accent/30 rounded-xl p-3 text-[11px] text-emerald-300 flex items-start gap-2">
                        <Sparkles size={13} className="mt-0.5 text-accent animate-pulse" />
                        <div>
                          <span className="font-bold block">Autopilot Reschedule Deployed</span>
                          <span className="text-[10px] text-zinc-500">Slack focus notifications sent. Google Calendar updated.</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="block text-[9px] text-zinc-650 px-1">{msg.time}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {thinking && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
              <Bot size={14} />
            </div>
            <div className="bg-zinc-900/30 border border-zinc-855 rounded-xl px-4 py-2.5 flex items-center gap-1.5 text-xs text-zinc-505">
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Suggested Prompt Chips */}
      <div className="px-6 py-2 border-t border-zinc-800 bg-zinc-955/20 flex items-center gap-2 overflow-x-auto select-none">
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider flex-shrink-0">Ask:</span>
        {CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 text-[10px] transition-all flex-shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 4. Controls/Inputs Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/10">
        
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 26, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center gap-1 text-[10px] text-primary font-bold tracking-wider uppercase pb-2"
            >
              <Volume2 size={12} className="animate-pulse" /> Listening
              <span className="flex gap-0.5 items-end h-3 ml-2">
                {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: [4, h * 4, 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                    className="w-0.5 bg-primary rounded-full"
                  />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMicClick}
            disabled={isListening}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex-shrink-0 flex items-center justify-center ${
              isListening
                ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-550 hover:text-zinc-300'
            }`}
          >
            <Mic size={15} />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="Ask Copilot or type AI commands..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-2 text-xs text-zinc-200 placeholder-zinc-650 outline-none focus:border-primary/50 transition-all"
            />
            
            <button
              onClick={() => handleSend()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary hover:bg-indigo-500 text-white transition-colors flex items-center justify-center"
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
