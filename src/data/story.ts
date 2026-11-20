/**
 * 首章脚本内容
 *
 * 文案原则：只描述发生了什么，不评价玩家，不下性格判断。
 * 所有分支都是「不同」而不是「对错」。
 */

export type PrologueBeat = {
  id: string
  kicker: string
  lines: string[]
  /** 可选回应：只是不同语气，不影响结果 */
  choices?: { id: string; label: string; reply: string }[]
}

export const PROLOGUE_BEATS: PrologueBeat[] = [
  {
    id: 'rain',
    kicker: '雨',
    lines: ['先别急着睁眼。', '听一听雨。'],
  },
  {
    id: 'room',
    kicker: '房间',
    lines: [
      '你在一间不太熟悉的房间里醒来。',
      '桌上的灯还亮着，窗外的街道看不太清楚。',
    ],
  },
  {
    id: 'letter',
    kicker: '信',
    lines: [
      '桌上有一封没有写地址的信。',
      '开头只有一句话：',
      '「如果你读到这里，说明这座城市还留着你的位置。」',
    ],
    choices: [
      {
        id: 'read',
        label: '把信读完',
        reply: '后面的字迹很轻，你花了些时间才看清。信没有署名，也没有结尾。',
      },
      {
        id: 'put',
        label: '先放下',
        reply: '你把信放回原处。它没有催你，只是安静地躺在那里。',
      },
    ],
  },
  {
    id: 'map',
    kicker: '地图',
    lines: [
      '信封下面压着一张空白的地图。',
      '你把它展开，街道、屋顶和树在纸上慢慢显影。',
    ],
  },
  {
    id: 'door',
    kicker: '门',
    lines: [
      '走廊的尽头有一点光。',
      '不是灯，也不像阳光。',
      '你决定去看看。',
    ],
  },
]

// ---------------------------------------------------------------------------

export type DialogueLine = {
  speaker: 'narrator' | 'lumi'
  text: string
}

export type DialogueChoice = {
  id: string
  label: string
  next: string
}

export type DialogueNode = {
  id: string
  lines: DialogueLine[]
  choices?: DialogueChoice[]
  /** 无选项时点击继续前往的节点；null 表示对话结束 */
  next?: string | null
}

export const LUMI_FIRST_MEETING: Record<string, DialogueNode> = {
  start: {
    id: 'start',
    lines: [
      {
        speaker: 'narrator',
        text: '老树下有一团小小的光，像谁把一盏灯忘在了傍晚里。',
      },
      {
        speaker: 'lumi',
        text: '你终于来了。我等了一会儿，不算太久。',
      },
    ],
    choices: [
      { id: 'who', label: '你是谁？', next: 'who' },
      { id: 'pass', label: '我只是路过。', next: 'pass' },
      { id: 'silent', label: '（安静地看着它）', next: 'silent' },
    ],
  },
  who: {
    id: 'who',
    lines: [
      { speaker: 'lumi', text: '我叫微光。住在城里，也住在没人注意的角落。' },
      { speaker: 'narrator', text: '你报了自己的名字。它认真地听，像是在记住。' },
      { speaker: 'lumi', text: '记住了。名字是很轻的东西，但有人记得，就不一样。' },
    ],
    next: 'city',
  },
  pass: {
    id: 'pass',
    lines: [
      { speaker: 'lumi', text: '路过也好。' },
      { speaker: 'lumi', text: '路过的人常常看见更多东西，因为他们不急着到达。' },
    ],
    next: 'city',
  },
  silent: {
    id: 'silent',
    lines: [
      { speaker: 'lumi', text: '不说话也没关系。' },
      { speaker: 'lumi', text: '我也常常这样，想说的太多，反而安静下来。' },
    ],
    next: 'city',
  },
  city: {
    id: 'city',
    lines: [
      { speaker: 'lumi', text: '这座城还没建完。' },
      { speaker: 'lumi', text: '有些地方亮着灯，有些地方还是空地。和你差不多。' },
    ],
    choices: [
      { id: 'where', label: '我该去哪里？', next: 'where' },
      { id: 'what', label: '这里是什么地方？', next: 'what' },
    ],
  },
  where: {
    id: 'where',
    lines: [
      {
        speaker: 'lumi',
        text: '去你想去的地方。家、校园、公园，现在都能进。',
      },
      { speaker: 'lumi', text: '我不能替你选。但我可以陪你走一段。' },
    ],
    next: 'end',
  },
  what: {
    id: 'what',
    lines: [
      { speaker: 'lumi', text: '未完成之城。' },
      { speaker: 'lumi', text: '名字听上去像没做完，其实是说——还来得及。' },
    ],
    next: 'end',
  },
  end: {
    id: 'end',
    lines: [
      { speaker: 'lumi', text: '去走走吧。' },
      { speaker: 'lumi', text: '想说话的时候，喊我一声就好。' },
    ],
    next: null,
  },
}

/** 认识之后的简短应答：不分析、不追问，只表示在场 */
export const LUMI_SMALL_TALK: Record<string, DialogueNode> = {
  start: {
    id: 'start',
    lines: [
      { speaker: 'lumi', text: '我在这儿。' },
      { speaker: 'lumi', text: '想说什么都可以，不想说也可以。' },
    ],
    next: null,
  },
}
