export interface ChapterMeta {
  id: number
  code: string
  title: string
  subtitle: string
  weeklyHeadline: string
  weeklyBody: string
}

export const chapters: ChapterMeta[] = [
  {
    id: 1,
    code: 'CHAPTER 01',
    title: '初入未完成之城',
    subtitle: '门后是日光，和一条可以慢慢走的路。',
    weeklyHeadline: '今天，城市\n没有催你。',
    weeklyBody: '钟走得很慢，风从河面过来。去哪里都可以，不留下记录也可以。',
  },
  {
    id: 2,
    code: 'CHAPTER 02',
    title: '雨停之后',
    subtitle: '日光 · 熟路',
    weeklyHeadline: '熟悉的街道，\n今天多了一句新的。',
    weeklyBody: '水洼里映着天光。还是那些街道，走法可以换一换。',
  },
]

export function chapterMeta(chapter: number): ChapterMeta {
  return chapters.find((item) => item.id === chapter) ?? chapters[0]!
}
