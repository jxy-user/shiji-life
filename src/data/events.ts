import type { ArtKey } from '../domain/types'

export interface EventChoice {
  id: string
  label: string
  description: string
  result: string
}

export interface CityEvent {
  id: string
  sceneId: string
  code: string
  title: string
  kicker: string
  introduction: string
  artKey: ArtKey
  choices: EventChoice[]
}

export const events: CityEvent[] = [
  {
    id: 'bench',
    sceneId: 'plaza',
    code: '现场记录 004',
    title: '长椅上的老人',
    kicker: '广场 / 18:40',
    introduction: '老人独自坐在广场西侧。他手里没有报纸，只是看着来往的人。长椅的另一端空着。',
    artKey: 'sketch-oldman',
    choices: [
      {
        id: 'sit',
        label: '在他旁边坐下',
        description: '把脚步放慢一点',
        result: '你在他旁边坐下。他没有转头，只把身子往长椅的另一端挪了挪。你们一起看了一会儿广场。临走时，他说：“今天的风，比昨天软。”',
      },
      {
        id: 'look',
        label: '远远地看一眼',
        description: '保持一点距离',
        result: '你远远地看了一眼。他像一棵在午后打盹的树。你没有走过去，但记住了这个下午。',
      },
      {
        id: 'walk',
        label: '继续走自己的路',
        description: '让相遇停在原地',
        result: '你继续走自己的路。经过他身后时，听见他轻轻哼了一句旧歌。旋律很短，像只唱了一半。',
      },
    ],
  },
  {
    id: 'bread',
    sceneId: 'blocks',
    code: '现场记录 007',
    title: '面包店刚出炉',
    kicker: '街区 / 08:20',
    introduction: '炉火刚退，第一盘面包放在窗台上晾。老板娘抬头看见你，没有招呼。',
    artKey: 'sketch-mugs',
    choices: [
      {
        id: 'buy',
        label: '买一个还热着的',
        description: '今天早点吃',
        result: '面包很烫，你把它捧在手里走了半条街。老板娘在你背后说了句什么，你没听清，但路口的风是甜的。',
      },
      {
        id: 'help',
        label: '帮忙把招牌收进来',
        description: '顺手的事',
        result: '招牌比看上去沉。她道了谢，多塞给你一个边角烤焦的。你说不用，她已经转身去照看下一炉。',
      },
      {
        id: 'smell',
        label: '只是站着闻一会儿',
        description: '不进去',
        result: '你站在檐下数了几次呼吸。出炉的香气很具体，像有人把「今天」烤成了可以带走的样子。',
      },
    ],
  },
  {
    id: 'window',
    sceneId: 'school',
    code: '现场记录 011',
    title: '图书馆靠窗的位置',
    kicker: '校园 / 15:10',
    introduction: '靠窗那张桌子空着。有人留了一本没读完的书，用铅笔压着。',
    artKey: 'sketch-map',
    choices: [
      {
        id: 'sit',
        label: '坐下，把那本书读完',
        description: '接一段别人的进度',
        result: '你从别人折角的地方读起。故事接得上的部分不多，但阳光在桌面上移动的速度很诚实。',
      },
      {
        id: 'own',
        label: '换一张桌子，读自己带的',
        description: '借光，不借书',
        result: '你坐在斜对角。那本被铅笔压着的书一直没人来取。下课铃响时，你把位置让给了进来找座的人。',
      },
      {
        id: 'look',
        label: '看一眼窗外就离开',
        description: '图书馆只是路过',
        result: '窗外的操场比记忆里小。你把这段路走完了，没有留下借书证，也没有打扰那本书。',
      },
    ],
  },
  {
    id: 'boatman',
    sceneId: 'harbor',
    code: '现场记录 015',
    title: '问船夫时间',
    kicker: '河港 / 18:05',
    introduction: '船夫坐在缆桩上，手里那块旧表比水面还亮。他好像一直在等有人问时间。',
    artKey: 'sketch-bridge',
    choices: [
      {
        id: 'ask',
        label: '问他现在几点',
        description: '他大概想被人问',
        result: '「六点过五分。」他把表转过来给你看，又补了一句，「水涨了，明早的船会早一点。」你说知道了。他知道你知道了。',
      },
      {
        id: 'sit',
        label: '坐到他旁边的缆桩',
        description: '不问，陪着',
        result: '你们没说话。船一艘一艘靠岸，又一条一条离开。旧表的滴答被水声盖过去，时间反而不急着走。',
      },
      {
        id: 'leave',
        label: '点点头就走',
        description: '有些招呼不必展开',
        result: '你路过时他抬了抬下巴，你也点了点头。走出去很远，还能听见缆绳松开的声音。',
      },
    ],
  },
]

export function getEvent(eventId: string | undefined) {
  return events.find((event) => event.id === eventId)
}
