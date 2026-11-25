import type { DialogueScript } from './types'

export const firstExplore: DialogueScript = {
  id: 'ms-first-explore',
  lines: [
    { speaker: 'narrator', text: '你把一个地点走成了「到过」。地图上于是多了一枚小小的图钉。' },
    { speaker: 'lumi', text: '不用急着集齐。城市又不会跑。' },
  ],
}

export const firstEvent: DialogueScript = {
  id: 'ms-first-event',
  lines: [
    { speaker: 'lumi', text: '刚才那一段，已经留在你的档案里了。授权不授权，都由你。' },
    { speaker: 'narrator', text: '微光把便签折好，塞回口袋。' },
  ],
}

export const firstJournal: DialogueScript = {
  id: 'ms-first-journal',
  lines: [
    { speaker: 'lumi', text: '写下第一个字之后，后面的会容易一些。' },
    { speaker: 'lumi', text: '日记只属于你。城市不看。' },
  ],
}

export const firstActionDone: DialogueScript = {
  id: 'ms-first-action',
  lines: [
    { speaker: 'narrator', text: '一件小事完成了。微光在行动队列上盖了个章。' },
    { speaker: 'lumi', text: '做到，比想清楚更难得。今天就这样也很好。' },
  ],
}

export const reflectionUnlocked: DialogueScript = {
  id: 'ms-reflection',
  lines: [
    { speaker: 'lumi', text: '攒够三段授权的经历，阶段回顾就会亮起来。' },
    { speaker: 'lumi', text: '那里没有评分。只有一些「也许你是这样」的猜测，等你确认或否认。' },
  ],
}

export const chapterTwoOpen: DialogueScript = {
  id: 'ms-chapter-two',
  lines: [
    { speaker: 'narrator', text: '雨停了。街面上的水洼映着天光，像一块一块碎掉的镜子。' },
    { speaker: 'lumi', text: '第二章开始了。不是重来，是接着走。' },
    { speaker: 'lumi', text: '熟路也可以有新的走法。今天想去哪儿？' },
  ],
}
