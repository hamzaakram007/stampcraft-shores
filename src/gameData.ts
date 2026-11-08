export type Screen = 'home' | 'explore' | 'album' | 'build' | 'tour'

export type StampId =
  | 'shell'
  | 'coral'
  | 'driftwood'
  | 'seaglass'
  | 'starfish'
  | 'tide'

export type PieceId =
  | 'palm'
  | 'hut'
  | 'pier'
  | 'lantern'
  | 'garden'
  | 'dock'
  | 'lighthouse'
  | 'hammock'

export type StickerId = 'wave' | 'heart' | 'star' | 'clap'

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
}

export interface FriendIsland {
  id: string
  name: string
  owner: string
  theme: string
  layout: { piece: PieceId; x: number; y: number }[]
  greeting: string
}

export const STAMPS: StampDef[] = [
  { id: 'shell', name: 'Shell Stamp', how: 'Collect shells on Pebble Cove', emoji: '🐚', color: '#F4E4BC' },
  { id: 'coral', name: 'Coral Stamp', how: 'Tap coral blooms on Reef Bend', emoji: '🪸', color: '#E07A5F' },
  { id: 'driftwood', name: 'Driftwood Stamp', how: 'Stack wood on Windy Wharf', emoji: '🪵', color: '#C4A484' },
  { id: 'seaglass', name: 'Seaglass Stamp', how: 'Find glass after any explore', emoji: '💎', color: '#7EC8B8' },
  { id: 'starfish', name: 'Starfish Stamp', how: 'Complete 3 explores in a day', emoji: '⭐', color: '#F2CC8F' },
  { id: 'tide', name: 'Tide Stamp', how: 'Visit a friend island', emoji: '🌊', color: '#2A9D8F' },
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
  },
]

export const FRIEND_ISLANDS: FriendIsland[] = [
  {
    id: 'mira',
    name: 'Sunset Scoop',
    owner: 'Mira',
    theme: 'Golden hour picnic shore',
    greeting: 'Welcome! Leave a sticker if you like my pier.',
    layout: [
      { piece: 'palm', x: 1, y: 1 },
      { piece: 'hut', x: 2, y: 2 },
      { piece: 'pier', x: 3, y: 3 },
      { piece: 'lantern', x: 0, y: 2 },
    ],
  },
  {
    id: 'jun',
    name: 'Mossy Jetty',
    owner: 'Jun',
    theme: 'Quiet green docks',
    greeting: 'Shh — the fish are napping. Stickers welcome!',
    layout: [
      { piece: 'dock', x: 2, y: 1 },
      { piece: 'garden', x: 1, y: 2 },
      { piece: 'palm', x: 3, y: 0 },
      { piece: 'hammock', x: 0, y: 3 },
    ],
  },
  {
    id: 'aiko',
    name: 'Beacon Bay',
    owner: 'Aiko',
    theme: 'Lighthouse lookout',
    greeting: 'Climb the light and leave a star!',
    layout: [
      { piece: 'lighthouse', x: 2, y: 1 },
      { piece: 'pier', x: 1, y: 3 },
      { piece: 'lantern', x: 3, y: 2 },
      { piece: 'hut', x: 0, y: 1 },
    ],
  },
]

export const STICKERS: { id: StickerId; emoji: string; label: string }[] = [
  { id: 'wave', emoji: '👋', label: 'Wave' },
  { id: 'heart', emoji: '💕', label: 'Heart' },
  { id: 'star', emoji: '✨', label: 'Sparkle' },
  { id: 'clap', emoji: '👏', label: 'Clap' },
]

export const GRID_SIZE = 4

export function stampById(id: StampId) {
  return STAMPS.find((s) => s.id === id)!
}

export function pieceById(id: PieceId) {
  return PIECES.find((p) => p.id === id)!
}
