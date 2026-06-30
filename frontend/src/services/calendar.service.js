let token = localStorage.getItem('gcal_access_token') || null

const getClientId = () => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID
}

const isLiveMode = () => {
  const clientId = getClientId()
  return clientId && !clientId.startsWith('mock_') && clientId.trim().length > 10
}

const getMockEvents = () => {
  const defaultMock = [
    { id: 'evt_1', title: 'Daily Standup sync', source: 'calendar', start: 9, end: 10, reason: 'High calendar density this afternoon limits code time' },
    { id: 'evt_2', title: 'Refinement session', source: 'calendar', start: 14, end: 15 },
    { id: 'evt_3', title: 'Focus block: Stripe Webhooks', source: 'ai_focus', start: 10.5, end: 12.5 }
  ]
  const val = localStorage.getItem('mock_gcal_events')
  if (!val) {
    localStorage.setItem('mock_gcal_events', JSON.stringify(defaultMock))
    return defaultMock
  }
  return JSON.parse(val)
}

const saveMockEvents = (events) => {
  localStorage.setItem('mock_gcal_events', JSON.stringify(events))
}

export const calendarService = {
  isConnected() {
    return !!token
  },

  disconnect() {
    token = null
    localStorage.removeItem('gcal_access_token')
    localStorage.removeItem('mock_gcal_events')
  },

  async connectCalendar() {
    if (!isLiveMode()) {
      console.log("[DEBUG] Google Calendar: No client ID found. Initializing Mock Calendar mode.")
      return new Promise((resolve) => {
        setTimeout(() => {
          token = 'mock_gcal_token_123'
          localStorage.setItem('gcal_access_token', token)
          resolve(true)
        }, 1200)
      })
    }

    const clientId = getClientId()
    const redirectUri = window.location.origin + '/redirect.html'
    const scope = 'https://www.googleapis.com/auth/calendar'
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`

    return new Promise((resolve, reject) => {
      const popup = window.open(authUrl, 'GoogleAuth', 'width=600,height=600')
      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."))
        return
      }

      const checkHashInterval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkHashInterval)
            reject(new Error("Auth window closed by user."))
            return
          }

          const currentHref = popup.location.href
          if (currentHref && currentHref.startsWith(redirectUri)) {
            const hash = popup.location.hash
            if (hash) {
              const params = new URLSearchParams(hash.substring(1))
              const accessToken = params.get('access_token')
              if (accessToken) {
                token = accessToken
                localStorage.setItem('gcal_access_token', token)
                clearInterval(checkHashInterval)
                popup.close()
                resolve(true)
              }
            }
          }
        } catch (e) {
          // Cross-origin errors are expected until redirect completes
        }
      }, 500)
    })
  },

  async getEvents() {
    if (!isLiveMode() || !token) {
      console.log("[DEBUG] Fetching mock calendar events")
      return getMockEvents()
    }

    try {
      const timeMin = new Date()
      timeMin.setHours(0, 0, 0, 0)
      const timeMax = new Date()
      timeMax.setHours(23, 59, 59, 999)

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('gcal_access_token')
          token = null
          throw new Error("Calendar token expired. Please reconnect.")
        }
        throw new Error("Failed to fetch Google Calendar events.")
      }

      const data = await res.json()
      return (data.items || []).map(item => {
        const start = item.start?.dateTime ? new Date(item.start.dateTime) : new Date(item.start?.date)
        const end = item.end?.dateTime ? new Date(item.end.dateTime) : new Date(item.end?.date)
        
        const startHour = start.getHours() + start.getMinutes() / 60
        const endHour = end.getHours() + end.getMinutes() / 60

        return {
          id: item.id,
          title: item.summary || 'No Title',
          source: item.description?.includes('Sentri AI') ? 'ai_focus' : 'calendar',
          start: startHour,
          end: endHour,
          reason: item.description || '',
          googleEventId: item.id
        }
      })
    } catch (e) {
      console.error("[calendarService.getEvents] failed:", e)
      throw e
    }
  },

  async createFocusBlock(task, executionPlan) {
    const startHour = 9
    const endHour = 12

    const startTime = new Date()
    startTime.setHours(startHour, 0, 0, 0)
    const endTime = new Date()
    endTime.setHours(endHour, 0, 0, 0)

    if (!isLiveMode() || !token) {
      console.log("[DEBUG] Google Calendar (Mock): Creating focus block event for task:", task.title)
      const mockEv = {
        id: 'evt_gcal_' + Date.now(),
        title: `🔥 Deep Work - ${task.title}`,
        source: 'ai_focus',
        start: startHour,
        end: endHour,
        reason: 'Created automatically by Sentri AI.'
      }
      const list = getMockEvents()
      list.push(mockEv)
      saveMockEvents(list)
      return mockEv
    }

    try {
      const eventBody = {
        summary: `🔥 Deep Work - ${task.title}`,
        description: `Created automatically by Sentri AI.\n\nTask: ${task.title}\nDescription: ${task.description || ''}`,
        start: {
          dateTime: startTime.toISOString()
        },
        end: {
          dateTime: endTime.toISOString()
        }
      }

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      })

      if (!res.ok) {
        throw new Error("Failed to create Google Calendar event.")
      }

      const item = await res.json()
      return {
        id: item.id,
        title: item.summary,
        source: 'ai_focus',
        start: startHour,
        end: endHour,
        reason: item.description,
        googleEventId: item.id
      }
    } catch (e) {
      console.error("[calendarService.createFocusBlock] failed:", e)
      throw e
    }
  },

  async deleteFocusBlock(eventId) {
    if (!isLiveMode() || !token) {
      console.log("[DEBUG] Google Calendar (Mock): Deleting focus block event:", eventId)
      const list = getMockEvents()
      const filtered = list.filter(e => e.id !== eventId)
      saveMockEvents(filtered)
      return true
    }

    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Failed to delete Google Calendar event.")
      }
      return true
    } catch (e) {
      console.error("[calendarService.deleteFocusBlock] failed:", e)
      throw e
    }
  }
}
