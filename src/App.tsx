import { useMemo, useState } from 'react'
import {
  EXPLORE_SPOTS,
  FRIEND_ISLANDS,
  GRID_SIZE,
  PIECES,
  STAMPS,
  STICKERS,
  pieceById,
  stampById,
  type ExploreSpot,
  type FriendIsland,
  type PieceId,
  type Screen,
  type StickerId,
} from './gameData'
import { useGameState } from './useGameState'
import './App.css'

function IslandPreview({
  pieces,
  interactive,
  selected,
  onCell,
  onRemove,
}: {
  pieces: { id: string; piece: PieceId; x: number; y: number }[]
  interactive?: boolean
  selected?: PieceId | null
  onCell?: (x: number, y: number) => void
  onRemove?: (id: string) => void
}) {
  const cells = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const placed = pieces.find((p) => p.x === x && p.y === y)
      cells.push(
        <button
          key={`${x}-${y}`}
          type="button"
          className={`island-cell ${placed ? 'filled' : ''} ${interactive ? 'buildable' : ''}`}
          onClick={() => {
            if (placed && onRemove) onRemove(placed.id)
            else if (!placed && onCell) onCell(x, y)
          }}
          disabled={!interactive}
          aria-label={
            placed
              ? `${pieceById(placed.piece).name} at ${x},${y}`
              : `Empty tile ${x},${y}${selected ? `, place ${selected}` : ''}`
          }
        >
          {placed ? pieceById(placed.piece).emoji : interactive ? '·' : ''}
          {placed && interactive ? <span className="cell-x">×</span> : null}
        </button>,
      )
    }
  }
  return <div className="island-grid">{cells}</div>
}

function HomeScreen({
  island,
  totalStamps,
  onExplore,
  onBuild,
}: {
  island: { id: string; piece: PieceId; x: number; y: number }[]
  totalStamps: number
  onExplore: () => void
  onBuild: () => void
}) {
  return (
    <div className="screen">
      <h1 className="brand">
        Stampcraft
        <span>Shores</span>
      </h1>
      <p className="lede">Explore a cove, earn clear stamps, and stamp them into your island.</p>
      <div className="stamp-pill" aria-live="polite">
        ✒ {totalStamps} {totalStamps === 1 ? 'stamp' : 'stamps'} in your album
      </div>
      <div className="hero-island" aria-label="Your island preview">
        <IslandPreview pieces={island} />
      </div>
      <div className="cta-row">
        <button type="button" className="btn btn-primary" onClick={onExplore}>
          Explore a shore
        </button>
        <button type="button" className="btn btn-secondary" onClick={onBuild}>
          Build my island
        </button>
      </div>
      <div className="parent-strip">
        Parents: stamps are earned by named challenges — never random loot boxes. Spend them to unlock
        build pieces. Friend tours use stickers only (no open chat).
      </div>
    </div>
  )
}

function ExploreScreen({
  completed,
  onComplete,
}: {
  completed: string[]
  onComplete: (id: string) => void
}) {
  const [active, setActive] = useState<ExploreSpot | null>(null)
  const [taps, setTaps] = useState(0)
  const [targets, setTargets] = useState<{ id: number; left: string; top: string }[]>([])

  const startSpot = (spot: ExploreSpot) => {
    if (completed.includes(spot.id)) return
    setActive(spot)
    setTaps(0)
    const next = Array.from({ length: spot.tapsNeeded }, (_, i) => ({
      id: i,
      left: `${12 + ((i * 17) % 70)}%`,
      top: `${18 + ((i * 23) % 55)}%`,
    }))
    setTargets(next)
  }

  const tapTarget = (id: number) => {
    if (!active) return
    setTargets((t) => t.filter((x) => x.id !== id))
    setTaps((n) => {
      const next = n + 1
      if (next >= active.tapsNeeded) {
        onComplete(active.id)
        window.setTimeout(() => setActive(null), 400)
      }
      return next
    })
  }

  if (active) {
    const pct = Math.min(100, Math.round((taps / active.tapsNeeded) * 100))
    return (
      <div className="screen explore-play">
        <button type="button" className="back-link" onClick={() => setActive(null)}>
          ← Back to map
        </button>
        <h2 className="section-title">{active.name}</h2>
        <p className="section-sub">{active.challenge}</p>
        <div className="progress-bar" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="section-sub">
          {taps}/{active.tapsNeeded} · Reward: {active.rewardAmount} {stampById(active.rewardStamp).name}
        </p>
        <div className="tap-arena">
          {targets.map((t) => (
            <button
              key={t.id}
              type="button"
              className="tap-target"
              style={{ left: t.left, top: t.top }}
              onClick={() => tapTarget(t.id)}
              aria-label="Collect"
            >
              {active.emoji}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <h2 className="section-title">Explore</h2>
      <p className="section-sub">Short runs. Same rewards every time — no gacha.</p>
      <div className="spot-list">
        {EXPLORE_SPOTS.map((spot) => {
          const done = completed.includes(spot.id)
          return (
            <button
              key={spot.id}
              type="button"
              className="spot-card"
              disabled={done}
              onClick={() => startSpot(spot)}
            >
              <div className="spot-emoji">{spot.emoji}</div>
              <div className="card-copy">
                <h3>{spot.name}</h3>
                <p>
                  {spot.vibe} · +{spot.rewardAmount} {stampById(spot.rewardStamp).emoji}
                </p>
              </div>
              <span className={`badge ${done ? 'done' : ''}`}>{done ? 'Done today' : 'Play'}</span>
            </button>
          )
        })}
      </div>
      <div className="panel">
        <h2>Stamp economy</h2>
        <p>
          Each shore pays a listed stamp. First explore of the day also grants +1 Seaglass. Finish all three
          for +2 Starfish. Transparent and parent-readable.
        </p>
      </div>
    </div>
  )
}

function AlbumScreen({
  stamps,
  unlocked,
  onUnlock,
}: {
  stamps: Record<string, number>
  unlocked: PieceId[]
  onUnlock: (id: PieceId) => void
}) {
  return (
    <div className="screen">
      <h2 className="section-title">Stamp album</h2>
      <p className="section-sub">Spend stamps to unlock build pieces.</p>
      <div className="stamp-list">
        {STAMPS.map((s) => (
          <div key={s.id} className="stamp-card">
            <div className="stamp-emoji" style={{ ['--stamp-color' as string]: s.color }}>
              {s.emoji}
            </div>
            <div className="card-copy">
              <h3>{s.name}</h3>
              <p>{s.how}</p>
            </div>
            <span className="badge">×{stamps[s.id] ?? 0}</span>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Unlock shop</h2>
        <p>Pick a piece. Cost and stamp type are always shown up front.</p>
      </div>
      <div className="piece-list" style={{ marginTop: 10 }}>
        {PIECES.map((p) => {
          const owned = unlocked.includes(p.id)
          const have = stamps[p.stamp] ?? 0
          const can = !owned && have >= p.cost
          return (
            <button
              key={p.id}
              type="button"
              className="piece-card"
              disabled={owned || !can}
              onClick={() => onUnlock(p.id)}
            >
              <div className="piece-emoji">{p.emoji}</div>
              <div className="card-copy">
                <h3>{p.name}</h3>
                <p>
                  {p.blurb} · {p.cost} {stampById(p.stamp).emoji} {stampById(p.stamp).name}
                </p>
              </div>
              <span className={`badge ${owned ? 'done' : ''}`}>
                {owned ? 'Owned' : can ? 'Unlock' : `${have}/${p.cost}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BuildScreen({
  unlocked,
  island,
  onPlace,
  onRemove,
}: {
  unlocked: PieceId[]
  island: { id: string; piece: PieceId; x: number; y: number }[]
  onPlace: (piece: PieceId, x: number, y: number) => void
  onRemove: (id: string) => void
}) {
  const [selected, setSelected] = useState<PieceId | null>(unlocked[0] ?? null)
  const unlockedPieces = useMemo(
    () => PIECES.filter((p) => unlocked.includes(p.id)),
    [unlocked],
  )

  return (
    <div className="screen">
      <h2 className="section-title">Build shore</h2>
      <p className="section-sub">Tap a piece, then tap an empty tile. Tap a placed piece to pack it away.</p>
      <div className="palette" role="listbox" aria-label="Unlocked pieces">
        {unlockedPieces.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`palette-item ${selected === p.id ? 'selected' : ''}`}
            onClick={() => setSelected(p.id)}
          >
            <span className="pe">{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>
      <div className="hero-island">
        <IslandPreview
          pieces={island}
          interactive
          selected={selected}
          onCell={(x, y) => {
            if (!selected) return
            onPlace(selected, x, y)
          }}
          onRemove={onRemove}
        />
      </div>
      {!unlockedPieces.length ? (
        <div className="panel">
          <h2>No pieces yet</h2>
          <p>Explore shores and unlock stamps in the album first.</p>
        </div>
      ) : null}
    </div>
  )
}

function TourScreen({
  visited,
  stickersLeft,
  onVisit,
  onSticker,
}: {
  visited: string[]
  stickersLeft: { islandId: string; sticker: StickerId }[]
  onVisit: (id: string) => void
  onSticker: (islandId: string, sticker: StickerId) => void
}) {
  const [current, setCurrent] = useState<FriendIsland | null>(null)

  if (current) {
    const left = stickersLeft.find((s) => s.islandId === current.id)
    return (
      <div className="screen">
        <button type="button" className="back-link" onClick={() => setCurrent(null)}>
          ← All islands
        </button>
        <h2 className="section-title">{current.name}</h2>
        <p className="section-sub">
          {current.owner}'s shore · {current.theme}
        </p>
        <div className="hero-island">
          <IslandPreview
            pieces={current.layout.map((p, i) => ({
              id: `${current.id}-${i}`,
              piece: p.piece,
              x: p.x,
              y: p.y,
            }))}
          />
        </div>
        <div className="panel">
          <h2>{current.greeting}</h2>
          <p>Leave one sticker — no open chat in this MVP.</p>
          <div className="sticker-row">
            {STICKERS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="sticker-btn"
                disabled={Boolean(left)}
                title={s.label}
                onClick={() => onSticker(current.id, s.id)}
              >
                {s.emoji}
              </button>
            ))}
          </div>
          {left ? (
            <p className="economy-note">
              You left {STICKERS.find((s) => s.id === left.sticker)?.emoji} here. Simulated social only.
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <h2 className="section-title">Tour islands</h2>
      <p className="section-sub">Fake friend shores for the MVP. First visit earns a Tide stamp.</p>
      <div className="friend-list">
        {FRIEND_ISLANDS.map((f) => {
          const seen = visited.includes(f.id)
          const sticker = stickersLeft.find((s) => s.islandId === f.id)
          return (
            <button
              key={f.id}
              type="button"
              className="friend-card"
              onClick={() => {
                onVisit(f.id)
                setCurrent(f)
              }}
            >
              <div className="friend-emoji">🏝️</div>
              <div className="card-copy">
                <h3>
                  {f.name} · {f.owner}
                </h3>
                <p>{f.theme}</p>
              </div>
              <span className={`badge ${seen ? 'done' : ''}`}>
                {sticker ? STICKERS.find((s) => s.id === sticker.sticker)?.emoji : seen ? 'Visited' : 'Tour'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const NAV: { id: Screen; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '🏝️' },
  { id: 'explore', label: 'Explore', ico: '🧭' },
  { id: 'album', label: 'Stamps', ico: '📒' },
  { id: 'build', label: 'Build', ico: '🔨' },
  { id: 'tour', label: 'Tour', ico: '⛵' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const game = useGameState()

  return (
    <div className="app-shell">
      <div className="sky-band" aria-hidden />
      <div className="wave-layer" aria-hidden />

      {screen === 'home' && (
        <HomeScreen
          island={game.state.island}
          totalStamps={game.economySummary.total}
          onExplore={() => setScreen('explore')}
          onBuild={() => setScreen('build')}
        />
      )}
      {screen === 'explore' && (
        <ExploreScreen completed={game.state.completedExplores} onComplete={game.completeExplore} />
      )}
      {screen === 'album' && (
        <AlbumScreen
          stamps={game.state.stamps}
          unlocked={game.state.unlocked}
          onUnlock={game.unlockPiece}
        />
      )}
      {screen === 'build' && (
        <BuildScreen
          unlocked={game.state.unlocked}
          island={game.state.island}
          onPlace={game.placePiece}
          onRemove={game.removePiece}
        />
      )}
      {screen === 'tour' && (
        <TourScreen
          visited={game.state.visitedFriends}
          stickersLeft={game.state.stickersLeft}
          onVisit={game.visitFriend}
          onSticker={game.leaveSticker}
        />
      )}

      {game.state.toast ? <div className="toast">{game.state.toast}</div> : null}

      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={screen === item.id ? 'active' : ''}
            onClick={() => setScreen(item.id)}
          >
            <span className="ico">{item.ico}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
