import { create } from 'zustand'
import { agents, conversationMessages, logMessages } from '../utils/mockData'

const useDashboardStore = create((set, get) => ({
  // Boot sequence
  isBooting: true,
  bootProgress: 0,

  // Voice interaction state machine
  voiceState: 'idle', // 'idle' | 'humanSpeaking' | 'aiSpeaking'
  voiceAmplitude: 0.4,

  // Agents
  agents: agents,

  // Conversation transcript
  messages: [],
  messageIndex: 0,

  // System metrics (rolling arrays of last 30 values)
  performanceData: Array.from({ length: 30 }, () => 50 + Math.random() * 40),
  cpuData: Array.from({ length: 30 }, () => 20 + Math.random() * 50),
  memoryData: Array.from({ length: 30 }, () => 30 + Math.random() * 30),

  // Logs
  logs: [],
  logIndex: 0,

  // Global metrics
  totalTasks: 12345,
  projectMilestonePercent: 84,

  // Active tab
  activeTab: 0,

  // Actions
  setBooting: (val) => set({ isBooting: val }),
  setBootProgress: (val) => set({ bootProgress: val }),

  setVoiceState: (state) => {
    const amplitudes = { idle: 0.4, humanSpeaking: 0.3, aiSpeaking: 1.2 }
    set({ voiceState: state, voiceAmplitude: amplitudes[state] || 0.4 })
  },

  addMessage: () => {
    const { messageIndex } = get()
    const msg = conversationMessages[messageIndex % conversationMessages.length]
    const newMsg = { ...msg, timestamp: Date.now() }
    set((state) => ({
      messages: [...state.messages.slice(-6), newMsg],
      messageIndex: state.messageIndex + 1,
    }))
  },

  addLog: () => {
    const { logIndex } = get()
    const log = logMessages[logIndex % logMessages.length]
    const now = new Date()
    const ts = `${now.getFullYear().toString().slice(2)}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    set((state) => ({
      logs: [...state.logs.slice(-18), { ...log, timestamp: ts, id: Date.now() }],
      logIndex: state.logIndex + 1,
    }))
  },

  updateMetrics: () => {
    set((state) => ({
      performanceData: [...state.performanceData.slice(1), 40 + Math.random() * 50],
      cpuData: [...state.cpuData.slice(1), 20 + Math.random() * 50],
      memoryData: [...state.memoryData.slice(1), 30 + Math.random() * 30],
    }))
  },

  tickTotalTasks: () => {
    set((state) => ({ totalTasks: state.totalTasks + Math.floor(Math.random() * 5) + 1 }))
  },

  updateAgentMetric: (agentId) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId
          ? { ...a, metricValue: a.metricValue + (Math.random() > 0.5 ? 1 : -1) }
          : a
      ),
    }))
  },

  setActiveTab: (idx) => set({ activeTab: idx }),
}))

export default useDashboardStore
