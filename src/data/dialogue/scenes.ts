import type { DialogueScript } from './types'

/** 每个场景首次进入的一次性旁白。 */
export const sceneFirstVisit: Record<string, DialogueScript> = {
  plaza: {
    id: 'scene-plaza',
    lines: [
      { speaker: 'narrator', text: '中央广场。钟走得很慢，老树的影子被风挪来挪去。' },
      { speaker: 'lumi', text: '这里适合什么都不做。坐一会儿也算来过。' },
    ],
  },
  home: {
    id: 'scene-home',
    lines: [
      { speaker: 'narrator', text: '门没有锁。桌上那杯茶已经凉了，是你早上没喝完的。' },
      { speaker: 'lumi', text: '家不是任务列表。先把外套挂起来。' },
    ],
  },
  school: {
    id: 'scene-school',
    lines: [
      { speaker: 'narrator', text: '校园。走廊的光比记忆里长，有人抱着书从你身边经过。' },
      { speaker: 'lumi', text: '你不一定要成为谁。可以先借一张桌子坐坐。' },
    ],
  },
  blocks: {
    id: 'scene-blocks',
    lines: [
      { speaker: 'narrator', text: '街区。面包店的灯还亮着，巷子里有人在收衣服。' },
      { speaker: 'lumi', text: '烟火气不用打卡。闻到就算数。' },
    ],
  },
  park: {
    id: 'scene-park',
    lines: [
      { speaker: 'narrator', text: '公园。草被晒得有点卷，长椅上有人打盹。' },
      { speaker: 'lumi', text: '树不评价你。坐着就好。' },
    ],
  },
  studio: {
    id: 'scene-studio',
    lines: [
      { speaker: 'narrator', text: '工作室。桌上摊着没做完的东西，窗外是河。' },
      { speaker: 'lumi', text: '没做完不等于做错。先看看今天想碰哪一下。' },
    ],
  },
  harbor: {
    id: 'scene-harbor',
    lines: [
      { speaker: 'narrator', text: '河港。水涨了一点，缆绳吱呀作响，船一艘一艘靠岸。' },
      { speaker: 'lumi', text: '看着船走也是一种休息。不用上船。' },
    ],
  },
  far: {
    id: 'scene-far',
    lines: [
      { speaker: 'narrator', text: '远方。地图的边缘画着一条虚线，虚线外面什么都没画。' },
      { speaker: 'lumi', text: '没画出来的地方，不是不能去。只是还没轮到。' },
    ],
  },
}
