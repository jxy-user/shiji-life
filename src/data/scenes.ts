import type { ArtKey } from '../domain/types'

export type SceneActionKind = 'record' | 'action' | 'event' | 'city'

export interface SceneAction {
  id: string
  title: string
  description: string
  kind: SceneActionKind
  eventId?: string
}

export interface Scene {
  id: string
  code: string
  area: string
  bar: string
  kicker: string
  title: string
  lede: string
  artKey: ArtKey
  objectPosition: string
  actions: SceneAction[]
}

export const scenes: Scene[] = [
  {
    id: 'plaza',
    code: '区域 01',
    area: '广场',
    bar: '中央广场 · 傍晚',
    kicker: '城市的心跳',
    title: '中央广场',
    lede: '广场中央的钟走得很慢。老树在西侧，叶子被风吹得沙沙响。',
    artKey: 'plaza',
    objectPosition: '50% 52%',
    actions: [
      { id: 'watch', title: '看看来往的人', description: '不赶时间', kind: 'event', eventId: 'bench' },
      { id: 'walk', title: '绕广场走一圈', description: '让腿先动起来', kind: 'action' },
      { id: 'sit', title: '在长椅上坐一会儿', description: '什么也不做', kind: 'event', eventId: 'bench' },
    ],
  },
  {
    id: 'home',
    code: '区域 A',
    area: '家',
    bar: '家 · 傍晚',
    kicker: '暂时的避风港',
    title: '家',
    lede: '门没有锁。桌上还留着早上没喝完的茶。',
    artKey: 'sketch-desk',
    objectPosition: '50% 48%',
    actions: [
      { id: 'clear', title: '收拾出一块空地', description: '先把桌面留给明天', kind: 'record' },
      { id: 'note', title: '写一张便条', description: '给回来时的自己', kind: 'action' },
      { id: 'outside', title: '出门走走', description: '把门轻轻带上', kind: 'city' },
    ],
  },
  {
    id: 'school',
    code: '区域 B',
    area: '校园',
    bar: '校园 · 下午',
    kicker: '知识的灯塔',
    title: '校园',
    lede: '下课铃刚响过。钟楼下的影子比早上短了一点。',
    artKey: 'sketch-map',
    objectPosition: '50% 35%',
    actions: [
      { id: 'listen', title: '在走廊听一会儿', description: '人声像退潮', kind: 'record' },
      { id: 'library', title: '去图书馆坐坐', description: '找一本没有目的的书', kind: 'event', eventId: 'window' },
      { id: 'return', title: '回到广场', description: '钟楼在身后', kind: 'city' },
    ],
  },
  {
    id: 'blocks',
    code: '区域 C',
    area: '街区',
    bar: '街区 · 傍晚',
    kicker: '熟悉的烟火气',
    title: '街区',
    lede: '面包店刚出炉，修鞋摊还没收。',
    artKey: 'sketch-mugs',
    objectPosition: '50% 45%',
    actions: [
      { id: 'bread', title: '买一个面包', description: '还热着', kind: 'record' },
      { id: 'talk', title: '和摊主聊两句', description: '不谈天气也可以', kind: 'event', eventId: 'bread' },
      { id: 'alley', title: '绕进旧巷', description: '路比记忆里窄', kind: 'city' },
    ],
  },
  {
    id: 'park',
    code: '区域 D',
    area: '公园',
    bar: '公园 · 下午',
    kicker: '呼吸的空间',
    title: '公园',
    lede: '草叶上有水。长椅的一端被太阳晒干了。',
    artKey: 'sketch-park',
    objectPosition: '50% 50%',
    actions: [
      { id: 'river', title: '沿河走一圈', description: '不数步数', kind: 'record' },
      { id: 'sun', title: '在长椅上坐坐', description: '让太阳晒一会儿', kind: 'action' },
      { id: 'kite', title: '看小孩放风筝', description: '线放得很长', kind: 'city' },
    ],
  },
  {
    id: 'studio',
    code: '区域 E',
    area: '工作室',
    bar: '工作室 · 傍晚',
    kicker: '创造与生活',
    title: '工作室',
    lede: '桌上有半张画，笔还没洗。',
    artKey: 'sketch-desk',
    objectPosition: '68% 48%',
    actions: [
      { id: 'tools', title: '整理画具', description: '把颜料按颜色排好', kind: 'record' },
      { id: 'draw', title: '画十分钟', description: '不画完也可以', kind: 'action' },
      { id: 'window', title: '打开窗', description: '让风进来', kind: 'city' },
    ],
  },
  {
    id: 'harbor',
    code: '区域 F',
    area: '河港',
    bar: '河港 · 傍晚',
    kicker: '流向远方',
    title: '河港',
    lede: '船靠岸了。水面把远处的塔折成两截。',
    artKey: 'sketch-bridge',
    objectPosition: '50% 48%',
    actions: [
      { id: 'boats', title: '看一会儿船', description: '不急', kind: 'record' },
      { id: 'walk', title: '沿河走', description: '走到桥再回来', kind: 'action' },
      { id: 'ask', title: '问船夫时间', description: '他戴着旧表', kind: 'event', eventId: 'boatman' },
    ],
  },
  {
    id: 'far',
    code: '区域 G',
    area: '远方',
    bar: '远方 · 起雾',
    kicker: '未闻的风景',
    title: '远方',
    lede: '路在雾里断了。再往前，是还没画完的地方。',
    artKey: 'sketch-plane',
    objectPosition: '50% 50%',
    actions: [
      { id: 'continue', title: '继续走', description: '走到路的尽头', kind: 'record' },
      { id: 'stop', title: '停下来', description: '听见远处的河', kind: 'action' },
      { id: 'back', title: '回头', description: '城市还在原地', kind: 'city' },
    ],
  },
]

export function getScene(sceneId: string | undefined) {
  return scenes.find((scene) => scene.id === sceneId)
}

/** 第 2 章二周目旁白：更短，带「又来了」的语气。 */
export const sceneNarrationAgain: Record<string, string> = {
  plaza: '又到广场。钟还是慢的，你已经认得这条路的走向。',
  home: '又回到家。茶杯还在老地方，这次你顺手换了热水。',
  school: '又路过校园。铃声响的时候，你没有躲。',
  blocks: '又是这条街。面包店的灯还亮着，你闻得出来今天的火候。',
  park: '又是公园。长椅还是那把，太阳换了角度。',
  studio: '又是工作室。半张画还在，灰尘比上次薄。',
  harbor: '又是河港。水涨了，船比上次靠外一点。',
  far: '又是远方。雾没散，虚线还是虚线。',
}
