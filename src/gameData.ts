export type Screen = 'home' | 'explore' | 'album' | 'build' | 'visit'

export type StampId =
  | 'shell'
  | 'coral'
  | 'driftwood'
  | 'seaglass'
  | 'starfish'
  | 'tide'
  | 'pearl'
  | 'moon'

export type PieceId =
  | 'palm'
  | 'hut'
  | 'pier'
  | 'lantern'
  | 'garden'
  | 'dock'
  | 'lighthouse'
  | 'hammock'
  | 'sandcastle'
  | 'buoy'
  | 'boat'
  | 'coralarch'
  | 'tidepool'
  | 'windchime'
  | 'campfire'
  | 'flag'

export type StickerId = 'wave' | 'heart' | 'star' | 'clap' | 'shell' | 'sun'

export type BuildMode = 'place' | 'remove'

export interface StampDef {
  id: StampId
  name: string
  how: string
  emoji: string
  color: string
}

export interface PieceDef {
  id: PieceId
  name: string
  cost: number
  stamp: StampId
  emoji: string
  blurb: string
}

export interface ExploreSpot {
  id: string
  name: string
  vibe: string
  challenge: string
  rewardStamp: StampId
  rewardAmount: number
  tapsNeeded: number
  emoji: string
  region: string
}

export interface FriendIsland {
  id: string
  name: string
  owner: string
  theme: string
  layout: { piece: PieceId; x: number; y: number }[]
  greeting: string
  guestbookHint: string
}

export interface WeeklyTheme {
  id: string
  title: string
  prompt: string
  emoji: string
  featuredStamp: StampId
  tip: string
}

export const STAMPS: StampDef[] = [
  { id: 'shell', name: 'Shell', how: 'Pebble Cove explores', emoji: '🐚', color: '#F4E4BC' },
  { id: 'coral', name: 'Coral', how: 'Reef Bend explores', emoji: '🪸', color: '#E07A5F' },
  { id: 'driftwood', name: 'Driftwood', how: 'Windy Wharf explores', emoji: '🪵', color: '#C4A484' },
  { id: 'seaglass', name: 'Seaglass', how: 'First explore each day', emoji: '💎', color: '#7EC8B8' },
  { id: 'starfish', name: 'Starfish', how: 'Finish 3 explores in a day', emoji: '⭐', color: '#F2CC8F' },
  { id: 'tide', name: 'Tide', how: 'Visit a friend shore', emoji: '🌊', color: '#2A9D8F' },
  { id: 'pearl', name: 'Pearl', how: 'Kelp Canyon + Moonlit Lagoon', emoji: '🫧', color: '#E8F4F8' },
  { id: 'moon', name: 'Moon', how: 'Join the weekly showcase', emoji: '🌙', color: '#9BB7D4' },
]

export const PIECES: PieceDef[] = [
  { id: 'palm', name: 'Palm Tree', cost: 2, stamp: 'shell', emoji: '🌴', blurb: 'Shade for your shore' },
  { id: 'hut', name: 'Beach Hut', cost: 3, stamp: 'shell', emoji: '🛖', blurb: 'A cozy little home' },
  { id: 'pier', name: 'Wooden Pier', cost: 2, stamp: 'driftwood', emoji: '🪵', blurb: 'Walk out over the water' },
  { id: 'lantern', name: 'Tide Lantern', cost: 2, stamp: 'coral', emoji: '🏮', blurb: 'Glows at dusk' },
  { id: 'garden', name: 'Shell Garden', cost: 3, stamp: 'seaglass', emoji: '🌸', blurb: 'Pretty shore blooms' },
  { id: 'dock', name: 'Tiny Dock', cost: 3, stamp: 'driftwood', emoji: '⛵', blurb: 'Park a toy boat' },
  { id: 'lighthouse', name: 'Mini Lighthouse', cost: 4, stamp: 'starfish', emoji: '🗼', blurb: 'Guides friends home' },
  { id: 'hammock', name: 'Palm Hammock', cost: 3, stamp: 'tide', emoji: '🛏️', blurb: 'Best nap spot' },
  { id: 'sandcastle', name: 'Sandcastle', cost: 3, stamp: 'shell', emoji: '🏰', blurb: 'Tide-safe towers' },
  { id: 'buoy', name: 'Stripe Buoy', cost: 2, stamp: 'coral', emoji: '🔴', blurb: 'Marks the swim lane' },
  { id: 'boat', name: 'Row Boat', cost: 4, stamp: 'pearl', emoji: '🛶', blurb: 'Ready for a paddle' },
  { id: 'coralarch', name: 'Coral Arch', cost: 3, stamp: 'pearl', emoji: '🪸', blurb: 'A soft reef doorway' },
  { id: 'tidepool', name: 'Tide Pool', cost: 3, stamp: 'seaglass', emoji: '🌀', blurb: 'Tiny fish hide here' },
  { id: 'windchime', name: 'Shell Chimes', cost: 2, stamp: 'moon', emoji: '🎐', blurb: 'Sings with the breeze' },
  { id: 'campfire', name: 'Shore Fire', cost: 3, stamp: 'moon', emoji: '🔥', blurb: 'Warm marshmallow night' },
  { id: 'flag', name: 'Island Flag', cost: 2, stamp: 'tide', emoji: '🏴‍☠️', blurb: 'Your shore’s name mark' },
]

export const EXPLORE_SPOTS: ExploreSpot[] = [
  {
    id: 'pebble',
    name: 'Pebble Cove',
    vibe: 'Soft waves, warm stones',
    challenge: 'Tap the shells before the tide rolls in',
    rewardStamp: 'shell',
    rewardAmount: 2,
    tapsNeeded: 5,
    emoji: '🏝️',
    region: 'East bay',
  },
  {
    id: 'reef',
    name: 'Reef Bend',
    vibe: 'Bright water, shy fish',
    challenge: 'Wake the coral by tapping each bloom',
    rewardStamp: 'coral',
    rewardAmount: 2,
    tapsNeeded: 6,
    emoji: '🐠',
    region: 'Shallow reef',
  },
  {
    id: 'wharf',
    name: 'Windy Wharf',
    vibe: 'Salt air, creaky boards',
    challenge: 'Stack three driftwood piles',
    rewardStamp: 'driftwood',
    rewardAmount: 2,
    tapsNeeded: 3,
    emoji: '🌬️',
    region: 'North pier',
  },
  {
    id: 'kelp',
    name: 'Kelp Canyon',
    vibe: 'Green ribbons, cool shade',
    challenge: 'Follow the pearl glints through the kelp',
    rewardStamp: 'pearl',
    rewardAmount: 2,
    tapsNeeded: 5,
    emoji: '🌿',
    region: 'Deep green',
  },
  {
    id: 'lagoon',
    name: 'Moonlit Lagoon',
    vibe: 'Quiet water, silver ripples',
    challenge: 'Catch moon pearls before they sink',
    rewardStamp: 'pearl',
    rewardAmount: 2,
    tapsNeeded: 4,
    emoji: '🌕',
    region: 'Night cove',
  },
  {
    id: 'stack',
    name: 'Shell Stack',
    vibe: 'Clattering shells, sunny rock',
    challenge: 'Build a shell tower — tap each layer',
    rewardStamp: 'shell',
    rewardAmount: 3,
    tapsNeeded: 7,
    emoji: '🐚',
    region: 'South spit',
  },
]

export const FRIEND_ISLANDS: FriendIsland[] = [
  {
    id: 'mira',
    name: 'Sunset Scoop',
    owner: 'Mira',
    theme: 'Golden hour picnic shore',
    greeting: 'Welcome! Leave a sticker if you like my pier.',
    guestbookHint: 'Mira left ✨ on your shore yesterday.',
    layout: [
      { piece: 'palm', x: 1, y: 1 },
      { piece: 'hut', x: 2, y: 2 },
      { piece: 'pier', x: 4, y: 4 },
      { piece: 'lantern', x: 0, y: 3 },
      { piece: 'sandcastle', x: 3, y: 1 },
      { piece: 'flag', x: 5, y: 0 },
    ],
  },
  {
    id: 'jun',
    name: 'Mossy Jetty',
    owner: 'Jun',
    theme: 'Quiet green docks',
    greeting: 'Shh — the fish are napping. Stickers welcome!',
    guestbookHint: 'Jun clapped for your dock.',
    layout: [
      { piece: 'dock', x: 2, y: 1 },
      { piece: 'garden', x: 1, y: 2 },
      { piece: 'palm', x: 4, y: 0 },
      { piece: 'hammock', x: 0, y: 4 },
      { piece: 'tidepool', x: 3, y: 3 },
      { piece: 'buoy', x: 5, y: 2 },
    ],
  },
  {
    id: 'aiko',
    name: 'Beacon Bay',
    owner: 'Aiko',
    theme: 'Lighthouse lookout',
    greeting: 'Climb the light and leave a star!',
    guestbookHint: 'Aiko waved from the lighthouse.',
    layout: [
      { piece: 'lighthouse', x: 2, y: 1 },
      { piece: 'pier', x: 1, y: 4 },
      { piece: 'lantern', x: 4, y: 2 },
      { piece: 'hut', x: 0, y: 1 },
      { piece: 'windchime', x: 5, y: 1 },
      { piece: 'campfire', x: 3, y: 4 },
    ],
  },
  {
    id: 'teo',
    name: 'Pearl Paddle',
    owner: 'Teo',
    theme: 'Boat-ready lagoon',
    greeting: 'Race you around the buoy — sticker if you win!',
    guestbookHint: 'Teo left a 🐚 on your guestbook.',
    layout: [
      { piece: 'boat', x: 2, y: 2 },
      { piece: 'buoy', x: 4, y: 1 },
      { piece: 'coralarch', x: 1, y: 3 },
      { piece: 'dock', x: 3, y: 4 },
      { piece: 'palm', x: 0, y: 0 },
      { piece: 'flag', x: 5, y: 5 },
    ],
  },
  {
    id: 'nori',
    name: 'Chime Cove',
    owner: 'Nori',
    theme: 'Moon wind and soft fires',
    greeting: 'Listen to the chimes, then leave a sun sticker.',
    guestbookHint: 'Nori warmed their hands at your fire.',
    layout: [
      { piece: 'windchime', x: 1, y: 1 },
      { piece: 'campfire', x: 3, y: 2 },
      { piece: 'hammock', x: 4, y: 4 },
      { piece: 'garden', x: 0, y: 3 },
      { piece: 'lantern', x: 5, y: 0 },
      { piece: 'tidepool', x: 2, y: 5 },
    ],
  },
]

/** Rotating weekly themes keyed by ISO week number */
export const WEEKLY_THEMES: WeeklyTheme[] = [
  {
    id: 'lantern-night',
    title: 'Lantern Night',
    prompt: 'Light your shore with lanterns, fires, and soft glow pieces.',
    emoji: '🏮',
    featuredStamp: 'moon',
    tip: 'Place at least 3 glow pieces, then enter Showcase.',
  },
  {
    id: 'shell-parade',
    title: 'Shell Parade',
    prompt: 'Line your shore with shells, gardens, and sandcastles.',
    emoji: '🐚',
    featuredStamp: 'shell',
    tip: 'A parade path of 4+ pieces looks great in Showcase.',
  },
  {
    id: 'quiet-docks',
    title: 'Quiet Docks',
    prompt: 'Build piers, docks, boats, and buoys for a calm harbor.',
    emoji: '⛵',
    featuredStamp: 'driftwood',
    tip: 'Harbor pieces earn smiles from visiting friends.',
  },
  {
    id: 'reef-garden',
    title: 'Reef Garden',
    prompt: 'Grow coral arches, tide pools, and garden blooms.',
    emoji: '🪸',
    featuredStamp: 'pearl',
    tip: 'Mix living reef with soft sand paths.',
  },
]

export const STICKERS: { id: StickerId; emoji: string; label: string }[] = [
  { id: 'wave', emoji: '👋', label: 'Wave' },
  { id: 'heart', emoji: '💕', label: 'Heart' },
  { id: 'star', emoji: '✨', label: 'Sparkle' },
  { id: 'clap', emoji: '👏', label: 'Clap' },
  { id: 'shell', emoji: '🐚', label: 'Shell' },
  { id: 'sun', emoji: '☀️', label: 'Sun' },
]

export const GRID_SIZE = 6

export const PIECE_SHORT: Record<PieceId, string> = {
  palm: 'a',
  hut: 'b',
  pier: 'c',
  lantern: 'd',
  garden: 'e',
  dock: 'f',
  lighthouse: 'g',
  hammock: 'h',
  sandcastle: 'i',
  buoy: 'j',
  boat: 'k',
  coralarch: 'l',
  tidepool: 'm',
  windchime: 'n',
  campfire: 'o',
  flag: 'p',
}

export const SHORT_TO_PIECE: Record<string, PieceId> = Object.fromEntries(
  Object.entries(PIECE_SHORT).map(([k, v]) => [v, k]),
) as Record<string, PieceId>

export function stampById(id: StampId) {
  return STAMPS.find((s) => s.id === id)!
}

export function pieceById(id: PieceId) {
  return PIECES.find((p) => p.id === id)!
}

export function isoWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function currentWeeklyTheme(date = new Date()) {
  const week = isoWeekNumber(date)
  return WEEKLY_THEMES[week % WEEKLY_THEMES.length]
}

export function glowPiecesForTheme(theme: WeeklyTheme): PieceId[] {
  switch (theme.id) {
    case 'lantern-night':
      return ['lantern', 'campfire', 'lighthouse', 'windchime']
    case 'shell-parade':
      return ['sandcastle', 'garden', 'palm', 'flag']
    case 'quiet-docks':
      return ['pier', 'dock', 'boat', 'buoy']
    case 'reef-garden':
      return ['coralarch', 'tidepool', 'garden', 'buoy']
    default:
      return ['lantern', 'palm']
  }
}
