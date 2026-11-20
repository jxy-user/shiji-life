import type { CandidateInsight, LifeExperience } from '@/game/saveSchema'

/**
 * 候选观察规则（M3 的 mock 分析器）
 *
 * 只输出两类东西：玩家实际做过的选择，以及「这可能意味着什么」的**猜测**。
 * 每个候选必须带证据 id；证据不足就不生成。
 * 真 AI 接入后（M4）会替换本文件的实现，但输出契约与证据校验保持一致。
 */

type TagRule = {
  tag: string
  title: string
  hypothesis: string
  question: string
}

const TAG_RULES: TagRule[] = [
  {
    tag: 'avoid',
    title: '绕开的那几步',
    hypothesis: '看起来，在几次不同的事情里，你都选了先绕开一步。',
    question: '绕开的时候，你心里通常在顾虑什么？',
  },
  {
    tag: 'approach',
    title: '先迈出去的那几步',
    hypothesis: '看起来，在几次不同的事情里，你都选了先往前一步。',
    question: '往前一步之前，你想的是什么？',
  },
  {
    tag: 'wait',
    title: '先等一等',
    hypothesis: '看起来，在几次不同的事情里，你都选了先等一等再说。',
    question: '等待的时候，你在等什么？',
  },
  {
    tag: 'observe',
    title: '先看看再说',
    hypothesis: '看起来，在几次不同的事情里，你都选了先观察一会儿。',
    question: '观察的时候，你注意到的通常是什么？',
  },
]

/**
 * 候选 id = 会话 id + 规则 key。
 *
 * 稳定 id 是去重的前提：玩家回去调整授权后重新生成时，
 * 同一条规则产出的仍是同一个候选，不会因为换了个随机 id 而重复入档。
 */
function createCandidate(
  reflectionId: string,
  ruleKey: string,
  input: Omit<CandidateInsight, 'id' | 'reflectionId' | 'status' | 'createdAt'>,
): CandidateInsight {
  return {
    ...input,
    id: `${reflectionId}-${ruleKey}`,
    reflectionId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}

function quote(experience: LifeExperience): string {
  return `《${experience.eventTitle}》里选了「${experience.choiceText}」`
}

function listTitles(experiences: LifeExperience[]): string {
  return experiences.map((experience) => `《${experience.eventTitle}》`).join('、')
}

/**
 * 根据已授权经历生成 0–2 条候选观察。
 * 证据不足（少于 2 条相关经历）时返回空数组，不硬凑结论。
 */
export function buildCandidateInsights(
  experiences: LifeExperience[],
  reflectionId: string,
): CandidateInsight[] {
  const candidates: CandidateInsight[] = []
  const usable = experiences.filter((experience) => experience.deletedAt === null)

  // 规则一：同一类做法的重复出现
  for (const rule of TAG_RULES) {
    const matches = usable.filter((experience) =>
      experience.choiceTags.includes(rule.tag),
    )
    if (matches.length < 2) continue

    const evidence = matches.slice(0, 3)
    candidates.push(
      createCandidate(reflectionId, `tag-${rule.tag}`, {
        category: 'patterns',
        title: rule.title,
        description: `${listTitles(evidence)}里，你分别${evidence
          .map((experience) => `「${experience.choiceText}」`)
          .join('、')}。`,
        hypothesis: `${rule.hypothesis}这只是两次记录里的相似，不是关于你的结论。`,
        uncertainty: '也可能只是那几次的情况碰巧相似。',
        questionForPlayer: rule.question,
        evidenceIds: evidence.map((experience) => experience.id),
      }),
    )
    break // 只取第一条命中的常用做法，避免把回顾变成清单
  }

  // 规则二：同一个地方的两种不同做法
  const byScene = new Map<string, LifeExperience[]>()
  for (const experience of usable) {
    const list = byScene.get(experience.sceneId) ?? []
    list.push(experience)
    byScene.set(experience.sceneId, list)
  }

  for (const [, list] of byScene) {
    if (list.length < 2) continue
    const [first, second] = list
    const firstTag = first.choiceTags[0]
    const secondTag = second.choiceTags[0]
    if (!firstTag || !secondTag || firstTag === secondTag) continue

    candidates.push(
      createCandidate(reflectionId, `scene-${first.sceneId}`, {
        category: 'thinking',
        title: '同一个地方的两种做法',
        description: `在同一个地方，你${quote(first)}，另一次${quote(second)}。`,
        hypothesis: '面对相似的情形，你的做法并不固定。可能取决于当时的心情，也可能取决于别的什么。',
        uncertainty: '两次记录还太少，看不出更多。',
        questionForPlayer: '这两次之间，你觉得有什么不一样？',
        evidenceIds: [first.id, second.id],
      }),
    )
    break
  }

  return candidates.slice(0, 2)
}
