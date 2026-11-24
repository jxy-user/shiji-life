/**
 * 人生线：18 → 60 岁的重大抉择
 *
 * 一条主线、若干节点；每个节点给 2–3 个选择，选择后推进一段新的剧情。
 * 不设对错，不做道德评判；结局只统计选择倾向，并如实回放，不贴标签。
 */

export const LIFE_TAGS = ['explore', 'steady', 'connect', 'self', 'give'] as const
export type LifeTag = (typeof LIFE_TAGS)[number]

export const LIFE_TAG_LABELS: Record<LifeTag, string> = {
  explore: '向外走',
  steady: '守住',
  connect: '靠近人',
  self: '回到自己',
  give: '交出去',
}

const TAG_DESCRIPTIONS: Record<LifeTag, string> = {
  explore: '你更常选择向外走：换城市、换方向、试试没做过的事。',
  steady: '你更常选择守住：把已经有的东西照顾得更久一点。',
  connect: '你更常选择靠近人：把时间留给家人、朋友和身边的人。',
  self: '你更常选择回到自己：在忙乱里给自己留一块安静的地方。',
  give: '你更常选择交出去：把经验、位置和时间让给别人。',
}

export type LifeChoice = {
  id: string
  label: string
  /** 选择之后的一小段剧情：只写发生的事，不评价 */
  result: string
  tags: LifeTag[]
}

export type LifeNode = {
  id: string
  age: number
  title: string
  /** 一句场景提示 */
  scene: string
  prompt: string
  choices: LifeChoice[]
}

export const LIFE_NODES: LifeNode[] = [
  {
    id: 'age_18',
    age: 18,
    title: '志愿表',
    scene: '高考结束的夏天，志愿表摊在桌上。',
    prompt: '分数够得着几个方向，但没有人能替你选。',
    choices: [
      {
        id: 'steady',
        label: '选一个「看起来有前途」的专业',
        result: '你填了一个稳妥的名字。开学那天，你告诉自己，先这样。',
        tags: ['steady'],
      },
      {
        id: 'explore',
        label: '选一个「自己真的好奇」的方向',
        result: '你圈了那个不太确定的专业。家里沉默了一会儿，没再反对。',
        tags: ['explore'],
      },
      {
        id: 'connect',
        label: '选一个离家近的学校',
        result: '你留在了熟悉的城市。周末可以回家吃饭。',
        tags: ['connect'],
      },
    ],
  },
  {
    id: 'age_22',
    age: 22,
    title: '第一份工作',
    scene: '毕业了。三份 offer，落在不同的城市。',
    prompt: '你得先选一个地方落下脚。',
    choices: [
      {
        id: 'city',
        label: '去大城市，从头开始',
        result: '你拖着箱子下了火车。站台很长，人很多。',
        tags: ['explore'],
      },
      {
        id: 'home',
        label: '回小城，离家人近一点',
        result: '你回到长大的地方。街道比记忆里窄，但很熟。',
        tags: ['connect'],
      },
      {
        id: 'stay',
        label: '留在读书的城市，先做着',
        result: '你搬进一间小房子，继续熟悉的生活。',
        tags: ['steady'],
      },
    ],
  },
  {
    id: 'age_25',
    age: 25,
    title: '升职与离开',
    scene: '工作第三年，主管找你谈话。',
    prompt: '一个位置空出来了，也有一条别的路在等你。',
    choices: [
      {
        id: 'promote',
        label: '接下升职，代价是更少的时间',
        result: '你答应得很快，加班也来得很快。',
        tags: ['steady'],
      },
      {
        id: 'switch',
        label: '辞职，换一个真正想做的行业',
        result: '你交了辞职信，心里空了一下，又亮了一下。',
        tags: ['explore'],
      },
      {
        id: 'hold',
        label: '留在原位，把生活过稳',
        result: '你没有动。日子照旧，也还过得去。',
        tags: ['self'],
      },
    ],
  },
  {
    id: 'age_28',
    age: 28,
    title: '一起生活',
    scene: '有人问你，要不要一起住。',
    prompt: '这不是一个必须回答的问题，但对方在等。',
    choices: [
      {
        id: 'move',
        label: '搬过去，一起承担',
        result: '你们一起挑了一张旧沙发，搬上六楼。',
        tags: ['connect'],
      },
      {
        id: 'keep',
        label: '保持现在的距离',
        result: '你说再想想。对方点了点头，没有追问。',
        tags: ['self'],
      },
      {
        id: 'notready',
        label: '说还没准备好',
        result: '你说还没准备好。那之后，联系慢慢少了。',
        tags: ['explore'],
      },
    ],
  },
  {
    id: 'age_32',
    age: 32,
    title: '一套房',
    scene: '房价又涨了，中介一天打来三个电话。',
    prompt: '你把存款数字看了很多遍。',
    choices: [
      {
        id: 'buy',
        label: '贷款买下，把根扎在这里',
        result: '你签了字。三十年的数字落在纸上。',
        tags: ['steady'],
      },
      {
        id: 'rent',
        label: '继续租，把钱留给自己',
        result: '你搬了第三次家。行李一次比一次少。',
        tags: ['explore'],
      },
      {
        id: 'back',
        label: '回老家买，离父母近',
        result: '你买在老家，钥匙多配了一把。',
        tags: ['connect'],
      },
    ],
  },
  {
    id: 'age_36',
    age: 36,
    title: '一个机会',
    scene: '一个可能改变轨迹的机会，风险不小。',
    prompt: '它需要你拿出大部分的时间和积蓄。',
    choices: [
      {
        id: 'all',
        label: '全力拼一次',
        result: '你把能押的都押了上去。那段时间睡得很晚。',
        tags: ['explore'],
      },
      {
        id: 'none',
        label: '维持现在，不冒险',
        result: '你算了算家里的账，选择了不动。',
        tags: ['steady'],
      },
      {
        id: 'half',
        label: '分一半精力试试',
        result: '你留了一半时间给自己，一半给机会。',
        tags: ['self'],
      },
    ],
  },
  {
    id: 'age_40',
    age: 40,
    title: '父母的电话',
    scene: '父母年纪大了，电话里开始报喜不报忧。',
    prompt: '你听得出，有些事情他们没说。',
    choices: [
      {
        id: 'bring',
        label: '把他们接到身边',
        result: '家里多了一双拖鞋，也多了一些唠叨。',
        tags: ['connect'],
      },
      {
        id: 'visit',
        label: '定期回去，其余时间过自己的',
        result: '你固定了回家的日子，其余时间照常。',
        tags: ['self'],
      },
      {
        id: 'hire',
        label: '请人照顾，自己继续忙',
        result: '你请了人，也常打电话回去。',
        tags: ['steady'],
      },
    ],
  },
  {
    id: 'age_45',
    age: 45,
    title: '身体的提醒',
    scene: '体检报告上多了几个箭头。',
    prompt: '医生说，不算严重，但要注意。',
    choices: [
      {
        id: 'stop',
        label: '停下来，重新安排生活',
        result: '你把日程删了一半。第一次觉得空下来不慌。',
        tags: ['self'],
      },
      {
        id: 'push',
        label: '先扛过这个项目再说',
        result: '你说等这个项目结束就休息。项目结束后，又有下一个。',
        tags: ['steady'],
      },
      {
        id: 'slow',
        label: '换一种更慢的活法',
        result: '你换了一份钱少一点、时间多一点的工作。',
        tags: ['explore'],
      },
    ],
  },
  {
    id: 'age_50',
    age: 50,
    title: '交接',
    scene: '你成了别人口中的「前辈」。',
    prompt: '有些事，只有你能做；也有些事，该让别人做了。',
    choices: [
      {
        id: 'hand',
        label: '把手上的事交给年轻人',
        result: '你退到后面，看他们犯错，也看他们站住。',
        tags: ['give'],
      },
      {
        id: 'stay',
        label: '再撑几年，守住位置',
        result: '你没有交。位置还在，人也还在。',
        tags: ['steady'],
      },
      {
        id: 'learn',
        label: '去学一个全新的东西',
        result: '你报了一个班，是教室里年纪最大的那个。',
        tags: ['explore'],
      },
    ],
  },
  {
    id: 'age_55',
    age: 55,
    title: '一个年轻人的问题',
    scene: '有人来问你，该不该走你走过的路。',
    prompt: '他看着你，像在等一个标准答案。',
    choices: [
      {
        id: 'tell',
        label: '告诉他你的经验',
        result: '你讲了很多，也提醒他别全信。',
        tags: ['give'],
      },
      {
        id: 'letgo',
        label: '让他自己决定',
        result: '你说：「你自己试试看。」',
        tags: ['connect'],
      },
      {
        id: 'still',
        label: '说「我也还在找」',
        result: '你说自己也没想明白。他笑了，你也笑了。',
        tags: ['self'],
      },
    ],
  },
  {
    id: 'age_60',
    age: 60,
    title: '退休那天',
    scene: '最后一天下班，钥匙交出去。',
    prompt: '明天开始，时间都是你的了。',
    choices: [
      {
        id: 'begin',
        label: '开始一件一直想做的事',
        result: '你翻出那本旧笔记，第一页还空着。',
        tags: ['explore'],
      },
      {
        id: 'quiet',
        label: '安静地过每天',
        result: '你把闹钟关掉了。',
        tags: ['self'],
      },
      {
        id: 'family',
        label: '把时间留给家人',
        result: '你开始学着做饭，等他们回来。',
        tags: ['connect'],
      },
    ],
  },
]

export function findLifeNode(id: string | undefined): LifeNode | undefined {
  return LIFE_NODES.find((node) => node.id === id)
}

export type LifeSummary = {
  tag: LifeTag
  label: string
  description: string
  counts: Record<LifeTag, number>
  isTie: boolean
}

/** 统计选择倾向；平票时不写「更常」，改为中性描述 */
export function summarizeLife(
  choices: ReadonlyArray<{ tags?: readonly string[] } | null | undefined>,
): LifeSummary {
  const counts: Record<LifeTag, number> = {
    explore: 0,
    steady: 0,
    connect: 0,
    self: 0,
    give: 0,
  }

  for (const choice of choices) {
    // 存档被手工改坏时（例如 choices: [null]）也不能让回放页崩掉
    for (const tag of choice?.tags ?? []) {
      if (tag in counts) counts[tag as LifeTag] += 1
    }
  }

  const maxCount = Math.max(...LIFE_TAGS.map((tag) => counts[tag]))
  const leaders = LIFE_TAGS.filter((tag) => counts[tag] === maxCount)
  const isTie = maxCount > 0 && leaders.length > 1
  const top = leaders[0] ?? LIFE_TAGS[0]

  if (maxCount === 0) {
    return {
      tag: top,
      label: '还没有答案',
      description: '这一段还没有做出什么选择。',
      counts,
      isTie: false,
    }
  }

  return {
    tag: top,
    label: isTie ? '几种都有一点' : LIFE_TAG_LABELS[top],
    description: isTie
      ? '你的选择比较分散，没有哪一种明显更多。几条路都走过一点。'
      : TAG_DESCRIPTIONS[top],
    counts,
    isTie,
  }
}
