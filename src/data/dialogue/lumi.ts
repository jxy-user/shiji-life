import type { DialogueScript } from './types'

export const lumiInvite: DialogueScript = {
  id: 'lumi-invite',
  lines: [
    { speaker: 'lumi', text: '你来了。这里没有人催你走快一点。' },
    { speaker: 'narrator', text: '微光把一张空白便签推到你面前。' },
    { speaker: 'lumi', text: '今天不需要总结。如果愿意，就记住一个还不想忘记的瞬间。' },
  ],
}

export const lumiReturn: DialogueScript = {
  id: 'lumi-return',
  lines: [
    { speaker: 'lumi', text: '慢一点也算抵达。你可以随时回来坐一会儿。' },
  ],
}

export const lumiPlaza: DialogueScript = {
  id: 'lumi-plaza',
  lines: [
    { speaker: 'lumi', text: '广场的钟还是慢的。你不着急的时候，它反而走得更稳。' },
    { speaker: 'narrator', text: '微光在你旁边的台阶坐下，没有看你。' },
    { speaker: 'lumi', text: '看看来往的人就好。不用给今天打分。' },
  ],
}

export const lumiNight: DialogueScript = {
  id: 'lumi-night',
  lines: [
    { speaker: 'lumi', text: '天暗下来的时候，城市会变得诚实一点。' },
    { speaker: 'lumi', text: '如果累了，就把今天放下。明天它还在这里。' },
  ],
}
