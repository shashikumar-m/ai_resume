import { useAuth } from '../context/AuthContext'
import { historyAPI } from '../services/api'

export function useHistorySave() {
  const { user } = useAuth()

  const save = async (type, title, summary, score, data) => {
    if (!user) return // not logged in, skip
    try {
      await historyAPI.save(type, title, summary, score, data)
    } catch (e) {
      console.warn('History save failed:', e.message)
    }
  }

  return { save }
}
