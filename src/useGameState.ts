import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  EXPLORE_SPOTS,
  FRIEND_ISLANDS,
  PIECES,
  type PieceId,
  type StampId,
  type StickerId,
} from './gameData'

const STORAGE_KEY = 'stampcraft-shores-v1'

export interface PlacedPiece {
  id: string
  piece: PieceId
  x: number
  y: number
}

export interface LeftSticker {
  islandId: string
  sticker: StickerId
  at: number
}

export interface GameState {
  stamps: Record<StampId, number>
  unlocked: PieceId[]
  island: PlacedPiece[]
  completedExplores: string[]
  exploreCountToday: number
  exploreDay: string
  stickersLeft: LeftSticker[]
  visitedFriends: string[]
  hasSeaglassBonus: boolean
  toast: string | null
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function freshState(): GameState {
  return {
    stamps: {
      shell: 1,
      coral: 0,
      driftwood: 0,
      seaglass: 0,
      starfish: 0,
      tide: 0,
    },
    unlocked: ['palm'],
    island: [{ id: 'start-palm', piece: 'palm', x: 1, y: 2 }],
    completedExplores: [],
    exploreCountToday: 0,
    exploreDay: todayKey(),
    stickersLeft: [],
    visitedFriends: [],
    hasSeaglassBonus: false,
    toast: null,
  }
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as GameState
    const day = todayKey()
    if (parsed.exploreDay !== day) {
      parsed.exploreDay = day
      parsed.exploreCountToday = 0
      parsed.completedExplores = []
      parsed.hasSeaglassBonus = false
    }
    parsed.toast = null
    return { ...freshState(), ...parsed, stamps: { ...freshState().stamps, ...parsed.stamps } }
  } catch {
    return freshState()
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())

  useEffect(() => {
    const { toast: _t, ...persist } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
  }, [state])

  const showToast = useCallback((message: string) => {
    setState((s) => ({ ...s, toast: message }))
    window.setTimeout(() => {
      setState((s) => (s.toast === message ? { ...s, toast: null } : s))
    }, 2200)
  }, [])

  const addStamps = useCallback((id: StampId, amount: number) => {
    setState((s) => ({
      ...s,
      stamps: { ...s.stamps, [id]: (s.stamps[id] ?? 0) + amount },
    }))
  }, [])

  const completeExplore = useCallback(
    (spotId: string) => {
      const spot = EXPLORE_SPOTS.find((e) => e.id === spotId)
      if (!spot) return

      setState((s) => {
        if (s.completedExplores.includes(spotId)) return s

        const nextCompleted = [...s.completedExplores, spotId]
        const nextCount = s.exploreCountToday + 1
        const stamps = { ...s.stamps }
        stamps[spot.rewardStamp] = (stamps[spot.rewardStamp] ?? 0) + spot.rewardAmount

        let bonusNote = ''
        if (!s.hasSeaglassBonus) {
          stamps.seaglass = (stamps.seaglass ?? 0) + 1
          bonusNote = ' +1 Seaglass'
        }

        let starfishNote = ''
        if (nextCount >= 3 && s.exploreCountToday < 3) {
          stamps.starfish = (stamps.starfish ?? 0) + 2
          starfishNote = ' +2 Starfish (3 explores!)'
        }

        return {
          ...s,
          stamps,
          completedExplores: nextCompleted,
          exploreCountToday: nextCount,
          hasSeaglassBonus: true,
          toast: `Earned ${spot.rewardAmount} ${spot.rewardStamp} stamps${bonusNote}${starfishNote}`,
        }
      })

      window.setTimeout(() => {
        setState((s) => ({ ...s, toast: null }))
      }, 2800)
    },
    [],
  )

  const unlockPiece = useCallback(
    (pieceId: PieceId) => {
      const piece = PIECES.find((p) => p.id === pieceId)
      if (!piece) return
      setState((s) => {
        if (s.unlocked.includes(pieceId)) return s
        const have = s.stamps[piece.stamp] ?? 0
        if (have < piece.cost) {
          return { ...s, toast: `Need ${piece.cost} ${piece.stamp} stamps` }
        }
        return {
          ...s,
          stamps: { ...s.stamps, [piece.stamp]: have - piece.cost },
          unlocked: [...s.unlocked, pieceId],
          toast: `Unlocked ${piece.name}!`,
        }
      })
      window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200)
    },
    [],
  )

  const placePiece = useCallback(
    (pieceId: PieceId, x: number, y: number) => {
      setState((s) => {
        if (!s.unlocked.includes(pieceId)) return s
        const occupied = s.island.some((p) => p.x === x && p.y === y)
        if (occupied) {
          return { ...s, toast: 'That spot is taken — try another tile' }
        }
        return {
          ...s,
          island: [
            ...s.island,
            { id: `${pieceId}-${Date.now()}`, piece: pieceId, x, y },
          ],
          toast: `Placed ${pieceId} on your shore`,
        }
      })
      window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 1800)
    },
    [],
  )

  const removePiece = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      island: s.island.filter((p) => p.id !== id),
      toast: 'Piece packed away',
    }))
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 1600)
  }, [])

  const visitFriend = useCallback((islandId: string) => {
    setState((s) => {
      if (s.visitedFriends.includes(islandId)) return s
      const stamps = { ...s.stamps, tide: (s.stamps.tide ?? 0) + 1 }
      return {
        ...s,
        stamps,
        visitedFriends: [...s.visitedFriends, islandId],
        toast: 'Tide stamp! Friends love visitors.',
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200)
  }, [])

  const leaveSticker = useCallback((islandId: string, sticker: StickerId) => {
    setState((s) => {
      const already = s.stickersLeft.some((x) => x.islandId === islandId)
      if (already) {
        return { ...s, toast: 'You already left a sticker here' }
      }
      const friend = FRIEND_ISLANDS.find((f) => f.id === islandId)
      return {
        ...s,
        stickersLeft: [...s.stickersLeft, { islandId, sticker, at: Date.now() }],
        toast: `Sticker left for ${friend?.owner ?? 'friend'} — no chat needed`,
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200)
  }, [])

  const resetDemo = useCallback(() => {
    const next = freshState()
    setState(next)
    showToast('Fresh shore — stamps reset')
  }, [showToast])

  const economySummary = useMemo(() => {
    const total = Object.values(state.stamps).reduce((a, b) => a + b, 0)
    return { total, unlocked: state.unlocked.length, placed: state.island.length }
  }, [state.stamps, state.unlocked, state.island])

  return {
    state,
    economySummary,
    completeExplore,
    unlockPiece,
    placePiece,
    removePiece,
    visitFriend,
    leaveSticker,
    resetDemo,
    showToast,
    addStamps,
  }
}
