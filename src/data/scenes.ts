import type { SceneId } from '@/game/saveSchema'

export type SceneAction = {
  id: string
  label: string
  hint: string
  /** 精力变化，负数消耗、正数恢复 */
  energy: number
  /** 是否推进一个时段 */
  advancesTime: boolean
  /** 行动结果文案：只描述发生了什么，不评价玩家 */
  result: string
}

export type SceneDef = {
  id: SceneId
  name: string
  kicker: string
  intro: string[]
  actions: SceneAction[]
}

export const SCENES: Record<SceneId, SceneDef> = {
  plaza: {
    id: 'plaza',
    name: '中央广场',
    kicker: '城市的心跳',
    intro: [
      '广场中央的钟走得很慢。有人遛狗，有人低头看手机，也有人什么都不做。',
      '老树在广场西侧，叶子被风吹得沙沙响。',
    ],
    actions: [
      {
        id: 'watch',
        label: '看看来往的人',
        hint: '不赶时间',
        energy: 0,
        advancesTime: false,
        result: '你在长椅边站了一会儿。没有人注意你，也没有人催促你。',
      },
      {
        id: 'walk',
        label: '绕广场走一圈',
        hint: '让腿先动起来',
        energy: -5,
        advancesTime: true,
        result: '你沿着广场边缘走了一圈。石板路有一点旧，踩上去很安静。',
      },
      {
        id: 'sit',
        label: '在长椅上坐一会儿',
        hint: '什么也不做',
        energy: 8,
        advancesTime: true,
        result: '你坐了下来。风从树梢经过，带走了刚才那点说不上来的紧绷。',
      },
    ],
  },
  home: {
    id: 'home',
    name: '家',
    kicker: '你的房间',
    intro: [
      '房间不大。窗台上放着一盆不太精神的绿植，桌上还留着昨晚的杯子。',
      '门关着的时候，世界会小一点，也会安静一点。',
    ],
    actions: [
      {
        id: 'rest',
        label: '躺一会儿',
        hint: '把灯关掉',
        energy: 25,
        advancesTime: true,
        result: '你躺下来，听着楼上的脚步声。不知道过了多久，呼吸慢了下来。',
      },
      {
        id: 'arrange',
        label: '整理一下桌面',
        hint: '不为了谁',
        energy: -2,
        advancesTime: false,
        result: '你把杯子洗了，把纸叠好。房间没有变样，但好像宽敞了一点。',
      },
      {
        id: 'desk',
        label: '坐到桌前发呆',
        hint: '什么也不想',
        energy: 3,
        advancesTime: false,
        result: '你盯着窗外的光看了一会儿。有些念头来了又走，你没有留它们。',
      },
    ],
  },
  campus: {
    id: 'campus',
    name: '校园',
    kicker: '走廊的尽头',
    intro: [
      '下课铃刚响过，走廊里还留着人声的余温。',
      '公告栏上贴着社团招新的纸，边角已经卷起来了。',
    ],
    actions: [
      {
        id: 'corridor',
        label: '在走廊里走走',
        hint: '听听别人在聊什么',
        energy: -5,
        advancesTime: true,
        result: '你经过几间教室，有人在讨论作业，有人在约晚上吃什么。这些声音离你不远也不近。',
      },
      {
        id: 'backrow',
        label: '在教室后排坐下',
        hint: '没有人会点名',
        energy: -3,
        advancesTime: true,
        result: '后排的椅子有点凉。黑板上的字还没擦干净，你看了很久，没有急着理解。',
      },
      {
        id: 'board',
        label: '看看公告栏',
        hint: '也许有什么',
        energy: 0,
        advancesTime: false,
        result: '招新、讲座、失物招领。你记住了其中一个名字的位置，然后走开了。',
      },
    ],
  },
  park: {
    id: 'park',
    name: '公园',
    kicker: '城市留出的空白',
    intro: [
      '池塘边有几只鸭子，不太怕人。',
      '长椅背面的漆掉了一块，露出下面浅色的木头。',
    ],
    actions: [
      {
        id: 'lake',
        label: '沿着池塘走',
        hint: '慢一点',
        energy: -5,
        advancesTime: true,
        result: '水面把你的影子拉长又揉碎。你没有刻意想什么，脚步比刚才轻了。',
      },
      {
        id: 'bench',
        label: '在长椅上坐一会儿',
        hint: '看看云',
        energy: 10,
        advancesTime: true,
        result: '云移动得很慢。你数了几朵，然后忘了数到几。',
      },
      {
        id: 'listen',
        label: '闭上眼睛听',
        hint: '只到这里为止',
        energy: 4,
        advancesTime: false,
        result: '风、水声、远处小朋友的笑。城市在这一刻不像一座城，更像一个下午。',
      },
    ],
  },
}

/** 第一章允许进入的区域；其余区域显示建造中 */
export const OPEN_SCENES: SceneId[] = ['plaza', 'home', 'campus', 'park']
