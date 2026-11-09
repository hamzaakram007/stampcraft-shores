import { useEffect, useMemo, useState } from 'react'
import {
  EXPLORE_SPOTS,
  FRIEND_ISLANDS,
  GRID_SIZE,
  PIECES,
  STAMPS,
  STICKERS,
  glowPiecesForTheme,
  pieceById,
  stampById,
  type BuildMode,
  type ExploreSpot,
  type FriendIsland,
  type PieceId,
  type Screen,
  type StickerId,
  type WeeklyTheme,
} from './gameData'
import { useGameState, type PlacedPiece } from './useGameState'
import './App.css'

function IslandPreview({
  pieces,
  interactive,
  mode,
  selected,
  onCell,
  onRemove,
  size = GRID_SIZE,
}: {
  pieces: PlacedPiece[]
  interactive?: boolean
  mode?: BuildMode
  selected?: PieceId | null
  onCell?: (x: number, y: number) => void
  onRemove?: (id: string) => void
  size?: number
}) {
  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const placed = pieces.find((p) => p.x === x && p.y === y)
      const canAct =
        interactive &&
        ((mode === 'remove' && placed) || (mode !== 'remove' && !placed && selected) || (mode !== 'remove' && placed))
      cells.push(
        <button
          key={`${x}-${y}`}
          type="button"
          className={`island-cell ${placed ? 'filled' : ''} ${interactive ? 'buildable' : ''} ${
            mode === 'remove' && placed ? 'remove-hint' : ''
          } ${interactive && !placed && selected && mode !== 'remove' ? 'place-hint' : ''}`}
          onClick={() => {
            if (!interactive) return
            if (mode === 'remove') {
              if (placed && onRemove) onRemove(placed.id)
              return
            }
            if (placed && onRemove) onRemove(placed.id)
            else if (!placed && onCell) onCell(x, y)
          }}
          disabled={!interactive || (mode === 'remove' ? !placed : !canAct && !placed)}
          aria-label={
            placed
              ? `${pieceById(placed.piece).name} at ${x},${y}`
              : `Empty tile ${x},${y}${selected ? `, place ${selected}` : ''}`
          }
        >
          {placed ? (
            <span className="piece-pop">{pieceById(placed.piece).emoji}</span>
          ) : interactive && mode !== 'remove' ? (
            '·'
          ) : (
            ''
          )}
          {placed && interactive && mode === 'remove' ? <span className="cell-x">×</span> : null}
        </button>,
      )
    }
  }
  return (
    <div
      className="island-grid"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
      }}
    >
      {cells}
    </div>
  )
}

function HomeScreen({
  islandName,
  island,
  totalStamps,
  exploresLeft,
  theme,
  showcaseIn,
  onExplore,
  onBuild,
  onVisit,
  onShare,
}: {
  islandName: string
  island: PlacedPiece[]
  totalStamps: number
  exploresLeft: number
  theme: WeeklyTheme
  showcaseIn: boolean
  onExplore: () => void
  onBuild: () => void
  onVisit: () => void
  onShare: () => void
}) {
  return (
    <div className="screen home-screen">
      <div className="brand-block">
        <p className="brand-kicker">Kid-safe shore craft</p>
        <h1 className="brand">
          Stampcraft
          <span>Shores</span>
        </h1>
        <p className="lede">Explore coves, earn clear stamps, and stamp them into {islandName}.</p>
      </div>

      <div className="stamp-pill" aria-live="polite">
        <span className="pill-dot" aria-hidden />
        {totalStamps} stamps · {exploresLeft} shores left today
      </div>

      <div className="hero-island" aria-label={`${islandName} preview`}>
        <div className="hero-tide" aria-hidden />
        <div className="hero-label">{islandName}</div>
        <IslandPreview pieces={island} />
      </div>

      <div className="cta-row">
        <button type="button" className="btn btn-primary" onClick={onExplore}>
          Explore shores
        </button>
        <button type="button" className="btn btn-secondary" onClick={onBuild}>
          Build island
        </button>
      </div>

      <button type="button" className="theme-banner" onClick={onVisit}>
        <span className="theme-emoji">{theme.emoji}</span>
        <span className="theme-copy">
          <strong>This week: {theme.title}</strong>
          <span>{showcaseIn ? 'You’re in Showcase — tap to visit friends' : theme.prompt}</span>
        </span>
        <span className="theme-go">Visit →</span>
      </button>

      <div className="cta-row single">
        <button type="button" className="btn btn-ghost" onClick={onShare}>
          Copy island link
        </button>
      </div>

      <div className="parent-strip">
        Parents: stamps pay listed rewards — never gacha. Stickers only on visits (no open chat). Island
        links share layout only.
      </div>
    </div>
  )
}

function ExploreScreen({
  completed,
  exploreCount,
  onComplete,
}: {
  completed: string[]
  exploreCount: number
  onComplete: (id: string) => void
}) {
  const [active, setActive] = useState<ExploreSpot | null>(null)
  const [taps, setTaps] = useState(0)
  const [targets, setTargets] = useState<{ id: number; left: string; top: string }[]>([])
  const [justWon, setJustWon] = useState(false)

  const startSpot = (spot: ExploreSpot) => {
    if (completed.includes(spot.id)) return
    setActive(spot)
    setTaps(0)
    setJustWon(false)
    const next = Array.from({ length: spot.tapsNeeded }, (_, i) => ({
      id: i,
      left: `${10 + ((i * 19 + 7) % 72)}%`,
      top: `${16 + ((i * 27 + 11) % 58)}%`,
    }))
    setTargets(next)
  }

  const tapTarget = (id: number) => {
    if (!active || justWon) return
    setTargets((t) => t.filter((x) => x.id !== id))
    setTaps((n) => {
      const next = n + 1
      if (next >= active.tapsNeeded) {
        setJustWon(true)
        onComplete(active.id)
        window.setTimeout(() => setActive(null), 700)
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
        <p className="section-sub reward-line">
          {taps}/{active.tapsNeeded} · Always +{active.rewardAmount} {stampById(active.rewardStamp).emoji}{' '}
          {stampById(active.rewardStamp).name}
        </p>
        <div className={`tap-arena ${justWon ? 'won' : ''}`}>
          {targets.map((t) => (
            <button
              key={t.id}
              type="button"
              className="tap-target"
              style={{ left: t.left, top: t.top, animationDelay: `${(t.id % 5) * 0.12}s` }}
              onClick={() => tapTarget(t.id)}
              aria-label="Collect"
            >
              {active.emoji}
            </button>
          ))}
          {justWon ? <div className="win-burst">Stamp earned!</div> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <h2 className="section-title">Explore</h2>
      <p className="section-sub">
        Six gentle shores. Fixed rewards every time — no gacha. {exploreCount}/6 today · bonuses at 1, 3,
        and 5.
      </p>
      <div className="economy-chip-row" aria-label="Explore bonuses">
        <span className="eco-chip">1st → +1 💎</span>
        <span className="eco-chip">3 shores → +2 ⭐</span>
        <span className="eco-chip">5 shores → +1 🫧</span>
      </div>
      <div className="spot-list">
        {EXPLORE_SPOTS.map((spot, i) => {
          const done = completed.includes(spot.id)
          return (
            <button
              key={spot.id}
              type="button"
              className="spot-card"
              style={{ animationDelay: `${i * 0.05}s` }}
              disabled={done}
              onClick={() => startSpot(spot)}
            >
              <div className="spot-emoji">{spot.emoji}</div>
              <div className="card-copy">
                <h3>{spot.name}</h3>
                <p>
                  {spot.region} · {spot.vibe}
                </p>
                <p className="reward-inline">
                  +{spot.rewardAmount} {stampById(spot.rewardStamp).emoji} {stampById(spot.rewardStamp).name}
                </p>
              </div>
              <span className={`badge ${done ? 'done' : ''}`}>{done ? 'Done' : 'Play'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AlbumScreen({
  stamps,
  unlocked,
  total,
  onUnlock,
}: {
  stamps: Record<string, number>
  unlocked: PieceId[]
  total: number
  onUnlock: (id: PieceId) => void
}) {
  return (
    <div className="screen">
      <h2 className="section-title">Stamp album</h2>
      <p className="section-sub">
        Transparent economy: earn listed stamps, spend them up front. {total} in album · {unlocked.length}/
        {PIECES.length} pieces unlocked.
      </p>

      <div className="panel ledger-panel">
        <h2>How stamps work</h2>
        <p>
          Every shore shows its payout before you play. Unlock costs are fixed. Nothing random, nothing hidden —
          parents can read the whole ledger.
        </p>
      </div>

      <div className="stamp-grid">
        {STAMPS.map((s) => (
          <div key={s.id} className="stamp-tile" style={{ ['--stamp-color' as string]: s.color }}>
            <div className="stamp-tile-face">
              <span className="stamp-big">{s.emoji}</span>
              <strong>{s.name}</strong>
              <span className="stamp-count">×{stamps[s.id] ?? 0}</span>
            </div>
            <p>{s.how}</p>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Unlock shop</h2>
        <p>Pick a piece. Stamp type and cost always shown before you spend.</p>
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
  islandName,
  unlocked,
  island,
  onPlace,
  onRemove,
  onClear,
  onRename,
  onShare,
}: {
  islandName: string
  unlocked: PieceId[]
  island: PlacedPiece[]
  onPlace: (piece: PieceId, x: number, y: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  onRename: (name: string) => void
  onShare: () => void
}) {
  const [selected, setSelected] = useState<PieceId | null>(unlocked[0] ?? null)
  const [mode, setMode] = useState<BuildMode>('place')
  const unlockedPieces = useMemo(
    () => PIECES.filter((p) => unlocked.includes(p.id)),
    [unlocked],
  )

  useEffect(() => {
    if (selected && !unlocked.includes(selected)) {
      setSelected(unlocked[0] ?? null)
    }
  }, [unlocked, selected])

  return (
    <div className="screen">
      <h2 className="section-title">Build shore</h2>
      <p className="section-sub">
        {GRID_SIZE}×{GRID_SIZE} grid · {island.length} pieces placed. Place mode stamps; Remove packs away.
      </p>

      <label className="name-field">
        <span>Island name</span>
        <input
          value={islandName}
          maxLength={24}
          onChange={(e) => onRename(e.target.value)}
          aria-label="Island name"
        />
      </label>

      <div className="mode-toggle" role="group" aria-label="Build mode">
        <button
          type="button"
          className={mode === 'place' ? 'active' : ''}
          onClick={() => setMode('place')}
        >
          Place
        </button>
        <button
          type="button"
          className={mode === 'remove' ? 'active' : ''}
          onClick={() => setMode('remove')}
        >
          Remove
        </button>
      </div>

      <div className="palette" role="listbox" aria-label="Unlocked pieces">
        {unlockedPieces.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`palette-item ${selected === p.id && mode === 'place' ? 'selected' : ''}`}
            onClick={() => {
              setSelected(p.id)
              setMode('place')
            }}
          >
            <span className="pe">{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="hero-island build-stage">
        <div className="hero-tide" aria-hidden />
        <IslandPreview
          pieces={island}
          interactive
          mode={mode}
          selected={selected}
          onCell={(x, y) => {
            if (!selected || mode !== 'place') return
            onPlace(selected, x, y)
          }}
          onRemove={onRemove}
        />
      </div>

      <div className="build-actions">
        <button type="button" className="btn btn-ghost btn-small" onClick={onShare}>
          Share link
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => {
            if (window.confirm('Clear all pieces from your shore? Stamps stay.')) onClear()
          }}
        >
          Clear shore
        </button>
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

function VisitScreen({
  theme,
  showcaseIn,
  visited,
  stickersLeft,
  guestbook,
  island,
  islandName,
  shareCode,
  onVisit,
  onSticker,
  onEnterShowcase,
  onShare,
}: {
  theme: WeeklyTheme
  showcaseIn: boolean
  visited: string[]
  stickersLeft: { islandId: string; sticker: StickerId }[]
  guestbook: { from: string; sticker: StickerId; note: string; at: number }[]
  island: PlacedPiece[]
  islandName: string
  shareCode: string
  onVisit: (id: string) => void
  onSticker: (islandId: string, sticker: StickerId) => void
  onEnterShowcase: () => void
  onShare: () => void
}) {
  const [tab, setTab] = useState<'friends' | 'showcase' | 'share'>('friends')
  const [current, setCurrent] = useState<FriendIsland | null>(null)
  const glow = glowPiecesForTheme(theme)
  const glowCount = island.filter((p) => glow.includes(p.piece)).length

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
          <div className="hero-tide" aria-hidden />
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
          <p>Leave one sticker — friendly, no open chat.</p>
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
              You left {STICKERS.find((s) => s.id === left.sticker)?.emoji}. They’ll leave one on your guestbook
              when you visit.
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <h2 className="section-title">Visit</h2>
      <p className="section-sub">Friend tours, weekly showcase, and shareable shore codes — stickers only.</p>

      <div className="mode-toggle tabs" role="tablist">
        <button type="button" className={tab === 'friends' ? 'active' : ''} onClick={() => setTab('friends')}>
          Friends
        </button>
        <button
          type="button"
          className={tab === 'showcase' ? 'active' : ''}
          onClick={() => setTab('showcase')}
        >
          Showcase
        </button>
        <button type="button" className={tab === 'share' ? 'active' : ''} onClick={() => setTab('share')}>
          Share
        </button>
      </div>

      {tab === 'friends' ? (
        <>
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
                    {sticker
                      ? STICKERS.find((s) => s.id === sticker.sticker)?.emoji
                      : seen
                        ? 'Visited'
                        : '+Tide'}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="panel guestbook">
            <h2>Your guestbook</h2>
            <p>When you tour a friend, they leave a sticker-note on your shore — social without chat.</p>
            {guestbook.length ? (
              <ul className="guest-list">
                {guestbook.map((g) => (
                  <li key={`${g.from}-${g.at}`}>
                    <span className="guest-sticker">
                      {STICKERS.find((s) => s.id === g.sticker)?.emoji}
                    </span>
                    <span>
                      <strong>{g.from}</strong> — {g.note}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="economy-note">Tour a friend shore to start your guestbook.</p>
            )}
          </div>
        </>
      ) : null}

      {tab === 'showcase' ? (
        <>
          <div className="theme-banner static">
            <span className="theme-emoji">{theme.emoji}</span>
            <span className="theme-copy">
              <strong>{theme.title}</strong>
              <span>{theme.prompt}</span>
            </span>
          </div>
          <div className="hero-island">
            <div className="hero-tide" aria-hidden />
            <div className="hero-label">Showcase · {islandName}</div>
            <IslandPreview pieces={island} />
          </div>
          <div className="panel">
            <h2>{showcaseIn ? 'You’re featured this week' : 'Enter Showcase'}</h2>
            <p>
              {theme.tip} Theme glow pieces on shore: {glowCount}. Entering grants Moon stamps (listed, never
              random).
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 12 }}
              disabled={showcaseIn}
              onClick={onEnterShowcase}
            >
              {showcaseIn ? 'Already entered' : 'Enter weekly showcase (+Moon)'}
            </button>
          </div>
          <div className="showcase-rail" aria-label="Friend showcases">
            {FRIEND_ISLANDS.slice(0, 3).map((f) => (
              <button
                key={f.id}
                type="button"
                className="showcase-card"
                onClick={() => {
                  onVisit(f.id)
                  setCurrent(f)
                }}
              >
                <span className="sc-emoji">{f.layout[0] ? pieceById(f.layout[0].piece).emoji : '🏝️'}</span>
                <strong>{f.owner}</strong>
                <span>{theme.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {tab === 'share' ? (
        <div className="panel share-panel">
          <h2>Share your shore</h2>
          <p>
            Copy a link or shore code. Friends can open it to preview and optionally load the layout onto their
            device — layout only, no chat, no account.
          </p>
          <code className="share-code">{shareCode}</code>
          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={onShare}>
            Copy island link
          </button>
          <p className="economy-note" style={{ marginTop: 12 }}>
            Tip: rename your island on Build, place a few pieces, then share.
          </p>
        </div>
      ) : null}
    </div>
  )
}

const NAV: { id: Screen; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '🏝️' },
  { id: 'explore', label: 'Explore', ico: '🧭' },
  { id: 'album', label: 'Stamps', ico: '📒' },
  { id: 'build', label: 'Build', ico: '🔨' },
  { id: 'visit', label: 'Visit', ico: '⛵' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const game = useGameState()

  return (
    <div className="app-shell">
      <div className="sky-band" aria-hidden />
      <div className="wave-layer" aria-hidden />
      <div className="foam-drift" aria-hidden />

      {game.importedShore ? (
        <div className="import-banner" role="dialog" aria-label="Shared shore">
          <div>
            <strong>Shared shore: {game.importedShore.name}</strong>
            <p>{game.importedShore.layout.length} pieces in this link</p>
          </div>
          <div className="import-actions">
            <button type="button" className="btn btn-primary btn-small" onClick={game.applyImportedShore}>
              Load onto my shore
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={game.dismissImportedShore}>
              Dismiss
            </button>
          </div>
          <div className="mini-preview">
            <IslandPreview pieces={game.importedShore.layout} />
          </div>
        </div>
      ) : null}

      {screen === 'home' && (
        <HomeScreen
          islandName={game.state.islandName}
          island={game.state.island}
          totalStamps={game.economySummary.total}
          exploresLeft={game.economySummary.exploresLeft}
          theme={game.weeklyTheme}
          showcaseIn={game.isInShowcase}
          onExplore={() => setScreen('explore')}
          onBuild={() => setScreen('build')}
          onVisit={() => setScreen('visit')}
          onShare={() => {
            void game.copyShareLink()
          }}
        />
      )}
      {screen === 'explore' && (
        <ExploreScreen
          completed={game.state.completedExplores}
          exploreCount={game.state.exploreCountToday}
          onComplete={game.completeExplore}
        />
      )}
      {screen === 'album' && (
        <AlbumScreen
          stamps={game.state.stamps}
          unlocked={game.state.unlocked}
          total={game.economySummary.total}
          onUnlock={game.unlockPiece}
        />
      )}
      {screen === 'build' && (
        <BuildScreen
          islandName={game.state.islandName}
          unlocked={game.state.unlocked}
          island={game.state.island}
          onPlace={game.placePiece}
          onRemove={game.removePiece}
          onClear={game.clearIsland}
          onRename={game.renameIsland}
          onShare={() => {
            void game.copyShareLink()
          }}
        />
      )}
      {screen === 'visit' && (
        <VisitScreen
          theme={game.weeklyTheme}
          showcaseIn={game.isInShowcase}
          visited={game.state.visitedFriends}
          stickersLeft={game.state.stickersLeft}
          guestbook={game.state.guestbook}
          island={game.state.island}
          islandName={game.state.islandName}
          shareCode={game.shareCode}
          onVisit={game.visitFriend}
          onSticker={game.leaveSticker}
          onEnterShowcase={game.enterShowcase}
          onShare={() => {
            void game.copyShareLink()
          }}
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
