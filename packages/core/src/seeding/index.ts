import type { Team } from '@court-iq/types'

/**
 * Sorts teams by DUPR rating descending and assigns seeds.
 * If two players have the same rating, they are seeded by name alphabetically.
 */
export function assignSeeds(teams: Team[]): Team[] {
  return [...teams]
    .sort((a, b) => {
      if (b.duprRating !== a.duprRating) return b.duprRating - a.duprRating
      return a.name.localeCompare(b.name)
    })
    .map((team, index) => ({ ...team, seed: index + 1 }))
}

/**
 * Distributes seeded teams into pools using snake-draft ordering.
 * e.g. with 4 pools: 1->A, 2->B, 3->C, 4->D, 5->D, 6->C, 7->B, 8->A ...
 */
export function distributeToPools(
  teams: Team[],
  poolCount: number
): Record<string, Team[]> {
  const poolNames = Array.from({ length: poolCount }, (_, i) =>
    String.fromCharCode(65 + i)
  )
  const pools: Record<string, Team[]> = {}
  for (const name of poolNames) pools[name] = []

  const seeded = assignSeeds(teams)

  seeded.forEach((team, index) => {
    const round = Math.floor(index / poolCount)
    const position = index % poolCount
    const poolIndex = round % 2 === 0 ? position : poolCount - 1 - position
    const poolName = poolNames[poolIndex]
    if (poolName) pools[poolName]!.push(team)
  })

  return pools
}
