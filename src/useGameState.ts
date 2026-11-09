import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  EXPLORE_SPOTS,
  FRIEND_ISLANDS,
  GRID_SIZE,
  PIECES,
  PIECE_SHORT,
  SHORT_TO_PIECE,
  currentWeeklyTheme,
  glowPiecesForTheme,
  type PieceId,
  type StampId,
  type StickerId,
} from './gameData'

const STORAGE_KEY = 'stampcraft-shores-v2'
const LEGACY_KEY = 'stampcraft-shores-v1'

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

export interface GuestbookEntry {
  from: string
  sticker: StickerId
  note: string
  at: number
}

export interface GameState {
  islandName: string
  stamps: Record<StampId, number>
  unlocked: PieceId[]
  island: PlacedPiece[]
  completedExplores: string[]
  exploreCountToday: number
  exploreDay: string
  stickersLeft: LeftSticker[]
  visitedFriends: string[]
  guestbook: GuestbookEntry[]
  hasSeaglassBonus: boolean
  showcaseEnteredWeek: string | null
  toast: string | null
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function weekKey() {
  const theme = currentWeeklyTheme()
  const d = new Date()
  return `${d.getUTCFullYear()}-W${theme.id}`
}

function freshState(): GameState {
  return {
    islandName: 'My Shore',
    stamps: {
      shell: 2,
      coral: 0,
      driftwood: 0,
      seaglass: 0,
      starfish: 0,
      tide: 0,
      pearl: 0,
      moon: 0,
    },
    unlocked: ['palm', 'flag'],
    island: [
      { id: 'start-palm', piece: 'palm', x: 2, y: 3 },
      { id: 'start-flag', piece: 'flag', x: 3, y: 2 },
    ],
    completedExplores: [],
    exploreCountToday: 0,
    exploreDay: todayKey(),
    stickersLeft: [],
    visitedFriends: [],
    guestbook: [],
    hasSeaglassBonus: false,
    showcaseEnteredWeek: null,
    toast: null,
  }
}

function migrateDay(state: GameState): GameState {
  const day = todayKey()
  if (state.exploreDay !== day) {
    return {
      ...state,
      exploreDay: day,
      exploreCountToday: 0,
      completedExplores: [],
      hasSeaglassBonus: false,
    }
  }
  return state
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as Partial<GameState>
    const base = freshState()
    const merged: GameState = {
      ...base,
      ...parsed,
      stamps: { ...base.stamps, ...(parsed.stamps ?? {}) },
      unlocked: Array.from(new Set([...(parsed.unlocked ?? base.unlocked)])),
      island: (parsed.island ?? base.island).filter(
        (p) => p.x >= 0 && p.y >= 0 && p.x < GRID_SIZE && p.y < GRID_SIZE,
      ),
      guestbook: parsed.guestbook ?? [],
      islandName: parsed.islandName ?? base.islandName,
      showcaseEnteredWeek: parsed.showcaseEnteredWeek ?? null,
      toast: null,
    }
    return migrateDay(merged)
  } catch {
    return freshState()
  }
}

/** Compact shareable shore code: SC2.name.pieceXY... */
export function encodeIslandCode(name: string, island: PlacedPiece[]) {
  const safeName = encodeURIComponent(name.slice(0, 24) || 'Shore')
  const body = island
    .map((p) => `${PIECE_SHORT[p.piece]}${p.x.toString(16)}${p.y.toString(16)}`)
    .join('')
  return `SC2.${safeName}.${body || 'empty'}`
}

export function decodeIslandCode(code: string): { name: string; layout: PlacedPiece[] } | null {
  try {
    const trimmed = code.trim()
    const parts = trimmed.split('.')
    if (parts.length < 3 || parts[0] !== 'SC2') return null
    const name = decodeURIComponent(parts[1]) || 'Shared Shore'
    const body = parts.slice(2).join('.')
    if (body === 'empty') return { name, layout: [] }
    const layout: PlacedPiece[] = []
    for (let i = 0; i + 2 < body.length; i += 3) {
      const piece = SHORT_TO_PIECE[body[i]]
      if (!piece) continue
      const x = parseInt(body[i + 1], 16)
      const y = parseInt(body[i + 2], 16)
      if (Number.isNaN(x) || Number.isNaN(y) || x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) {
        continue
      }
      layout.push({ id: `share-${i}`, piece, x, y })
    }
    return { name, layout }
  } catch {
    return null
  }
}

export function shareUrlForCode(code: string) {
  const url = new URL(window.location.href)
  url.hash = `shore=${encodeURIComponent(code)}`
  return url.toString()
}

export function readShoreFromHash() {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash.startsWith('shore=')) return null
  return decodeURIComponent(hash.slice('shore='.length))
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState())
  const [importedShore, setImportedShore] = useState<{
    name: string
    layout: PlacedPiece[]
    code: string
  } | null>(null)

  useEffect(() => {
    const { toast: _t, ...persist } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
  }, [state])

  useEffect(() => {
    const applyHash = () => {
      const code = readShoreFromHash()
      if (!code) return
      const decoded = decodeIslandCode(code)
      if (decoded) {
        setImportedShore({ ...decoded, code })
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  const showToast = useCallback((message: string) => {
    setState((s) => ({ ...s, toast: message }))
    window.setTimeout(() => {
      setState((s) => (s.toast === message ? { ...s, toast: null } : s))
    }, 2200)
  }, [])

  const completeExplore = useCallback((spotId: string) => {
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
        starfishNote = ' +2 Starfish'
      }

      let regionNote = ''
      if (nextCount >= 5 && s.exploreCountToday < 5) {
        stamps.pearl = (stamps.pearl ?? 0) + 1
        regionNote = ' +1 Pearl (5 shores!)'
      }

      return {
        ...s,
        stamps,
        completedExplores: nextCompleted,
        exploreCountToday: nextCount,
        hasSeaglassBonus: true,
        toast: `+${spot.rewardAmount} ${spot.rewardStamp}${bonusNote}${starfishNote}${regionNote}`,
      }
    })

    window.setTimeout(() => {
      setState((s) => ({ ...s, toast: null }))
    }, 2800)
  }, [])

  const unlockPiece = useCallback((pieceId: PieceId) => {
    const piece = PIECES.find((p) => p.id === pieceId)
    if (!piece) return
    setState((s) => {
      if (s.unlocked.includes(pieceId)) return s
      const have = s.stamps[piece.stamp] ?? 0
      if (have < piece.cost) {
        return { ...s, toast: `Need ${piece.cost} ${piece.stamp}` }
      }
      return {
        ...s,
        stamps: { ...s.stamps, [piece.stamp]: have - piece.cost },
        unlocked: [...s.unlocked, pieceId],
        toast: `Unlocked ${piece.name}!`,
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200)
  }, [])

  const placePiece = useCallback((pieceId: PieceId, x: number, y: number) => {
    setState((s) => {
      if (!s.unlocked.includes(pieceId)) return s
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return s
      const occupied = s.island.some((p) => p.x === x && p.y === y)
      if (occupied) {
        return { ...s, toast: 'Spot taken — remove first or pick empty' }
      }
      const piece = PIECES.find((p) => p.id === pieceId)
      return {
        ...s,
        island: [...s.island, { id: `${pieceId}-${Date.now()}`, piece: pieceId, x, y }],
        toast: `Placed ${piece?.name ?? pieceId}`,
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 1600)
  }, [])

  const removePiece = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      island: s.island.filter((p) => p.id !== id),
      toast: 'Packed away',
    }))
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 1400)
  }, [])

  const clearIsland = useCallback(() => {
    setState((s) => ({
      ...s,
      island: [],
      toast: 'Shore cleared — stamps stay in your album',
    }))
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2000)
  }, [])

  const renameIsland = useCallback((name: string) => {
    const next = name.trim().slice(0, 24) || 'My Shore'
    setState((s) => ({ ...s, islandName: next }))
  }, [])

  const visitFriend = useCallback((islandId: string) => {
    setState((s) => {
      if (s.visitedFriends.includes(islandId)) return s
      const friend = FRIEND_ISLANDS.find((f) => f.id === islandId)
      const stamps = { ...s.stamps, tide: (s.stamps.tide ?? 0) + 1 }
      const guestbook = [...s.guestbook]
      if (friend && !guestbook.some((g) => g.from === friend.owner)) {
        const stickerPool: StickerId[] = ['wave', 'heart', 'star', 'clap', 'shell', 'sun']
        const sticker = stickerPool[guestbook.length % stickerPool.length]
        guestbook.unshift({
          from: friend.owner,
          sticker,
          note: friend.guestbookHint,
          at: Date.now(),
        })
      }
      return {
        ...s,
        stamps,
        visitedFriends: [...s.visitedFriends, islandId],
        guestbook: guestbook.slice(0, 12),
        toast: 'Tide stamp! They left a sticker on your shore.',
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2400)
  }, [])

  const leaveSticker = useCallback((islandId: string, sticker: StickerId) => {
    setState((s) => {
      const already = s.stickersLeft.some((x) => x.islandId === islandId)
      if (already) {
        return { ...s, toast: 'One sticker per friend shore' }
      }
      const friend = FRIEND_ISLANDS.find((f) => f.id === islandId)
      return {
        ...s,
        stickersLeft: [...s.stickersLeft, { islandId, sticker, at: Date.now() }],
        toast: `Sticker for ${friend?.owner ?? 'friend'} — no chat needed`,
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200)
  }, [])

  const enterShowcase = useCallback(() => {
    const theme = currentWeeklyTheme()
    const week = weekKey()
    setState((s) => {
      if (s.showcaseEnteredWeek === week) {
        return { ...s, toast: 'Already in this week’s showcase' }
      }
      const glow = glowPiecesForTheme(theme)
      const glowCount = s.island.filter((p) => glow.includes(p.piece)).length
      if (s.island.length < 3) {
        return { ...s, toast: 'Place at least 3 pieces to showcase' }
      }
      const stamps = { ...s.stamps }
      stamps.moon = (stamps.moon ?? 0) + 2
      if (glowCount >= 2) {
        stamps.moon = (stamps.moon ?? 0) + 1
      }
      return {
        ...s,
        stamps,
        showcaseEnteredWeek: week,
        toast:
          glowCount >= 2
            ? `Showcase in! +3 Moon (${theme.title} bonus)`
            : `Showcase in! +2 Moon stamps`,
      }
    })
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2600)
  }, [])

  const copyShareLink = useCallback(async () => {
    const code = encodeIslandCode(state.islandName, state.island)
    const url = shareUrlForCode(code)
    try {
      await navigator.clipboard.writeText(url)
      showToast('Island link copied!')
    } catch {
      showToast(`Code: ${code}`)
    }
    return { code, url }
  }, [state.islandName, state.island, showToast])

  const applyImportedShore = useCallback(() => {
    if (!importedShore) return
    setState((s) => ({
      ...s,
      islandName: importedShore.name,
      island: importedShore.layout.map((p, i) => ({
        ...p,
        id: `import-${i}-${Date.now()}`,
      })),
      toast: `Loaded “${importedShore.name}” from link`,
    }))
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setImportedShore(null)
    window.setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200)
  }, [importedShore])

  const dismissImportedShore = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setImportedShore(null)
  }, [])

  const resetDemo = useCallback(() => {
    setState(freshState())
    showToast('Fresh shore — demo reset')
  }, [showToast])

  const economySummary = useMemo(() => {
    const total = Object.values(state.stamps).reduce((a, b) => a + b, 0)
    const spentPotential = PIECES.filter((p) => state.unlocked.includes(p.id)).reduce(
      (a, p) => a + p.cost,
      0,
    )
    return {
      total,
      unlocked: state.unlocked.length,
      placed: state.island.length,
      spentPotential,
      exploresLeft: Math.max(0, EXPLORE_SPOTS.length - state.completedExplores.length),
    }
  }, [state.stamps, state.unlocked, state.island, state.completedExplores])

  const shareCode = useMemo(
    () => encodeIslandCode(state.islandName, state.island),
    [state.islandName, state.island],
  )

  const weeklyTheme = useMemo(() => currentWeeklyTheme(), [])
  const isInShowcase = state.showcaseEnteredWeek === weekKey()

  return {
    state,
    economySummary,
    shareCode,
    weeklyTheme,
    isInShowcase,
    importedShore,
    completeExplore,
    unlockPiece,
    placePiece,
    removePiece,
    clearIsland,
    renameIsland,
    visitFriend,
    leaveSticker,
    enterShowcase,
    copyShareLink,
    applyImportedShore,
    dismissImportedShore,
    resetDemo,
    showToast,
  }
}
