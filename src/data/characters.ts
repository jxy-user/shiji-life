import type { SceneId } from '@/game/saveSchema'

/**
 * 城市角色
 *
 * 玩法骨架借自恋爱模拟器：每个角色有自己的场景、理解度与事件链。
 * 但关系衡量的是「理解程度」，不是恋爱好感；角色是城市居民，不是攻略对象。
 */

export const CHARACTER_IDS = ['lin', 'zhou', 'yu'] as const
export type CharacterId = (typeof CHARACTER_IDS)[number]

export type CharacterAccent = 'gold' | 'sage' | 'sun'

export type CharacterDef = {
  id: CharacterId
  name: string
  role: string
  sceneId: SceneId
  accent: CharacterAccent
  intro: string[]
  /** 每次「打个招呼」后出现在页面上的短句 */
  greeting: string
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  lin: {
    id: 'lin',
    name: '林夏',
    role: '摄影社',
    sceneId: 'campus',
    accent: 'sage',
    intro: [
      '她总在走廊尽头的窗边，相机挂在手腕上。',
      '不太主动说话，但会认真看你在做什么。',
    ],
    greeting: '她抬头看了你一眼，把相机稍稍放低了一点。',
  },
  zhou: {
    id: 'zhou',
    name: '周野',
    role: '自由职业',
    sceneId: 'park',
    accent: 'sun',
    intro: [
      '他沿着池塘跑步，速度不快，呼吸很稳。',
      '路过时点了点头，没有停下来。',
    ],
    greeting: '他在跑道边停下，擦了擦汗，问你今天怎么样。',
  },
  yu: {
    id: 'yu',
    name: '余青',
    role: '街头速写',
    sceneId: 'plaza',
    accent: 'gold',
    intro: [
      '广场西侧，有人把画板架在膝上。',
      '铅笔在纸上走得很慢，像在等什么人经过。',
    ],
    greeting: '他往旁边挪了挪，画板上留出一小块空位。',
  },
}

export function findCharacter(id: string | undefined): CharacterDef | null {
  if (!id) return null
  return CHARACTERS[id as CharacterId] ?? null
}

export function charactersInScene(sceneId: SceneId): CharacterDef[] {
  return CHARACTER_IDS.map((id) => CHARACTERS[id]).filter(
    (character) => character.sceneId === sceneId,
  )
}
