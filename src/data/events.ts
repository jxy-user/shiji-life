import { gameEventSchema, type GameEvent } from '@/game/eventSchema'

/**
 * 首章事件内容
 *
 * 写作原则：
 * - 没有道德正确/错误选项，四个选择只是不同。
 * - 结果只写发生的事，不推断性格、不给评价。
 * - 分支有限，结束后都汇合到同一个「回到城市」。
 *
 * 授权默认值：false（来自设置 settings.analysisConsentDefault）。
 * 玩家在结果页与档案页都能逐条打开或撤回；M3 的回顾邀请需要先征得同意。
 */
const RAW_EVENTS: GameEvent[] = [
  {
    id: 'campus_001',
    title: '那个没有发出的消息',
    chapter: 'chapter_01',
    sceneId: 'campus',
    experienceType: 'social',
    trigger: 'scene_enter',
    once: true,
    narrative: [
      '周末的群里有人发了一条活动消息，问有没有人一起去。',
      '你其实有点想去，但还没有回复。',
    ],
    choices: [
      {
        id: 'ask',
        text: '主动问问具体安排',
        tags: ['approach'],
        result: [
          '你发了消息。对方回得很快，把时间地点都写清楚了。',
          '群里的其他人也陆续冒了头。',
        ],
      },
      {
        id: 'wait',
        text: '等别人再问一次',
        tags: ['wait'],
        result: [
          '你把手机放下，过了一会儿又拿起来。',
          '消息还停在原处，没有人再提起这件事。',
        ],
      },
      {
        id: 'decline',
        text: '说那天可能有别的事',
        tags: ['avoid'],
        result: [
          '你回了一句模棱两可的话。',
          '有人回了句「那下次」，话题很快转到别的地方。',
        ],
      },
      {
        id: 'close',
        text: '先关掉聊天框',
        tags: ['avoid'],
        result: [
          '你关掉聊天框，去做了别的事情。',
          '过了一会儿，你发现自己还在想那条消息。',
        ],
      },
    ],
    memory: { askReason: false },
  },
  {
    id: 'home_001',
    title: '永远在准备开始',
    chapter: 'chapter_01',
    sceneId: 'home',
    experienceType: 'action',
    trigger: 'scene_enter',
    once: true,
    narrative: [
      '桌角放着一个小项目。你研究了好几天，还没有开始动手。',
      '资料攒得很全，纸还是空的。',
    ],
    choices: [
      {
        id: 'minimal',
        text: '先做一个最小的版本',
        tags: ['approach'],
        result: [
          '你把要求压到最低，花了半小时做出一个粗糙的东西。',
          '它不好看，但它存在了。',
        ],
        effects: { energy: -10, advanceTime: true },
      },
      {
        id: 'research',
        text: '再查一会儿资料',
        tags: ['wait'],
        result: [
          '你又打开了几篇说明，记了两页笔记。',
          '纸还是空的，但你知道的事多了一点。',
        ],
        effects: { energy: -5, advanceTime: true },
      },
      {
        id: 'close',
        text: '把它合上，改天再说',
        tags: ['avoid'],
        result: ['你把东西收进抽屉。', '桌子空出来了，心里却没完全空。'],
      },
      {
        id: 'admit',
        text: '承认现在其实不想做',
        tags: ['honest'],
        result: [
          '你对自己说：现在不想做。',
          '说出口以后，那件事好像没那么压着人了。',
        ],
        effects: { energy: 5 },
      },
    ],
    memory: { askReason: true },
  },
  {
    id: 'plaza_001',
    title: '如果没有人评价你',
    chapter: 'chapter_01',
    sceneId: 'plaza',
    experienceType: 'inner',
    trigger: 'scene_enter',
    once: true,
    narrative: [
      '微光落在长椅的扶手上，看了你一会儿。',
      '「如果没有人评价你，你还会选现在的生活吗？」',
    ],
    choices: [
      {
        id: 'yes',
        text: '会，我还是想这样',
        tags: ['answer'],
        result: ['你点了点头。', '微光没有说好或不好，只是也坐了下来。'],
      },
      {
        id: 'another',
        text: '我想试试另一种',
        tags: ['explore'],
        result: [
          '你说想试试别的。',
          '微光问：「哪一种？」你说不太清楚，它说没关系。',
        ],
      },
      {
        id: 'unknown',
        text: '我还不知道',
        tags: ['unknown'],
        result: ['你说还不知道。', '微光说：「不知道也可以待在这里。」'],
      },
      {
        id: 'skip',
        text: '暂时不想回答',
        tags: ['skip'],
        result: ['你没有回答。', '微光把目光移向广场，没有再问。'],
      },
    ],
    memory: { askReason: false },
  },
  {
    id: 'park_001',
    title: '被落下的书',
    chapter: 'chapter_01',
    sceneId: 'park',
    experienceType: 'inner',
    trigger: 'scene_enter',
    once: true,
    narrative: [
      '长椅上放着一本书，扉页上有一个不认识的签名。',
      '看起来主人刚离开不久。',
    ],
    choices: [
      {
        id: 'office',
        text: '交给公园管理处',
        tags: ['approach'],
        result: [
          '你把它送到门口的小屋，登记了捡到的时间地点。',
          '管理员说会等人来问。',
        ],
        effects: { energy: -3, advanceTime: true },
      },
      {
        id: 'leave',
        text: '留在原地，继续散步',
        tags: ['avoid'],
        result: ['你把书摆回原来有点歪的角度，走开了。', '走出很远，你还记得那本书的颜色。'],
      },
      {
        id: 'wait',
        text: '坐下来等一会儿',
        tags: ['wait'],
        result: [
          '你在旁边的长椅上坐下，看了一会儿水面。',
          '二十分钟后，没有人来。你起身走了。',
        ],
        effects: { energy: 5, advanceTime: true },
      },
      {
        id: 'read',
        text: '翻开第一页看看',
        tags: ['observe'],
        result: [
          '第一页写着一行字，句子的前半段被水渍泡开了。',
          '你把书合上，放回原处。',
        ],
      },
    ],
    memory: { askReason: false },
  },
  {
    id: 'campus_002',
    title: '走廊里的三个人',
    chapter: 'chapter_01',
    sceneId: 'campus',
    experienceType: 'social',
    trigger: 'scene_enter',
    once: true,
    narrative: [
      '走廊拐角有三个人在聊天，其中两个你认识。',
      '你经过的时候，说话声停了一下。',
    ],
    choices: [
      {
        id: 'join',
        text: '停下来接一句',
        tags: ['approach'],
        result: [
          '你说了一句，他们笑了，话题继续下去。',
          '过了几分钟，你看了眼时间，先走了。',
        ],
      },
      {
        id: 'listen',
        text: '站在旁边听着',
        tags: ['observe'],
        result: [
          '你没有插话，站了一会儿。',
          '有人看了你一眼，又转回去继续讲。',
        ],
      },
      {
        id: 'leave',
        text: '找个借口走开',
        tags: ['avoid'],
        result: [
          '你说了句「我先去趟教室」，走开了。',
          '走出几步之后，身后的说话声重新响起来。',
        ],
      },
      {
        id: 'ask',
        text: '问一句他们在聊什么',
        tags: ['approach'],
        result: [
          '他们把事情从头讲了一遍，讲得有点乱。',
          '你听明白了个大概。',
        ],
      },
    ],
    memory: { askReason: false },
  },
]

/** 加载时统一校验：内容写错会在开发与构建阶段直接暴露 */
export const GAME_EVENTS: GameEvent[] = RAW_EVENTS.map((event) => gameEventSchema.parse(event))

export function findEvent(eventId: string | undefined): GameEvent | undefined {
  return GAME_EVENTS.find((event) => event.id === eventId)
}

/** 场景里还没发生过的第一个事件 */
export function pendingEventFor(sceneId: string, seenEventIds: string[]): GameEvent | undefined {
  return GAME_EVENTS.find(
    (event) => event.sceneId === sceneId && !seenEventIds.includes(event.id),
  )
}
