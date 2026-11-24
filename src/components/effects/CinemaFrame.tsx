/**
 * 电影画框：上下宽银幕黑边 + 暗角 + 胶片颗粒
 *
 * 固定覆盖在视口上，页面内容需要预留上下内边距（约 8vh）。
 */
export function CinemaFrame() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-20 h-[6.5vh] bg-[#050505]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[6.5vh] bg-[#050505]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[18] bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.64)_100%)]"
      />
      <div
        aria-hidden
        className="paper-grain pointer-events-none fixed inset-0 z-[19] animate-[grain-shift_1.6s_steps(5)_infinite] opacity-30"
      />
      {/* 偶尔闪过的胶片划痕 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-[17%] z-[19] w-px animate-[scratch_9s_linear_infinite] bg-white/20"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-[73%] z-[19] w-px animate-[scratch_13s_linear_infinite] bg-white/10"
      />
    </>
  )
}
