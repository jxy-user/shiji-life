import { Link } from 'react-router-dom'

type PlaceholderPageProps = {
  kicker: string
  title: string
  description: string
}

/**
 * M0 阶段占位页：只保证路由与视觉基线一致。
 * 每个页面在对应里程碑里会被真实实现替换。
 */
export default function PlaceholderPage({
  kicker,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col bg-cream-50">
      <div aria-hidden className="paper-grain absolute inset-0 opacity-70" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <Link
          to="/"
          className="mb-10 w-fit text-[12px] tracking-[0.2em] text-ink-400 transition-colors hover:text-ink-900"
        >
          ← 回到开始页
        </Link>

        <p className="text-[11px] tracking-[0.45em] text-gold-600">{kicker}</p>
        <h1 className="mt-4 font-display text-3xl tracking-[0.06em] text-ink-900">
          {title}
        </h1>
        <p className="mt-4 text-[14px] leading-7 text-ink-500">{description}</p>

        <div className="mt-12 rounded-2xl border border-dashed border-sand-300 bg-cream-100/60 px-5 py-6">
          <p className="text-[12px] leading-6 text-ink-400">
            这一页正在建造中。
            <br />
            当前版本只包含项目骨架与视觉基线。
          </p>
        </div>
      </div>
    </main>
  )
}
