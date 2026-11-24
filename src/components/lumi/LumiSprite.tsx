type LumiSpriteProps = {
  size?: number
  /** 说话时轻微放大，仅作为反馈，不代表情绪好坏的数值 */
  talking?: boolean
  className?: string
}

/**
 * 微光 Lumi：金色发光的小精灵
 *
 * 纯 SVG 绘制，不依赖图片素材，避免首屏等待和解码开销。
 * 表情变化留给后续里程碑，这里只保留「活着」的最小动作：漂浮与眨眼。
 */
export function LumiSprite({ size = 72, talking = false, className }: LumiSpriteProps) {
  return (
    <div
      aria-hidden
      className={['relative', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    >
      <div className="animate-float h-full w-full">
        <svg
          viewBox="0 0 100 100"
          className={[
            'h-full w-full transition-transform duration-500',
            talking ? 'scale-105' : 'scale-100',
          ].join(' ')}
        >
          <defs>
            <radialGradient id="lumi-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#e0c08a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#5a4726" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lumi-body" cx="42%" cy="36%" r="70%">
              <stop offset="0%" stopColor="#fff8e8" />
              <stop offset="42%" stopColor="#f0d9a8" />
              <stop offset="100%" stopColor="#e0c08a" />
            </radialGradient>
          </defs>

          {/* 光晕 */}
          <circle cx="50" cy="50" r="48" fill="url(#lumi-halo)" />

          {/* 翅膀 */}
          <ellipse
            cx="26"
            cy="44"
            rx="15"
            ry="7"
            fill="#fff8e8"
            opacity="0.5"
            transform="rotate(-18 26 44)"
          />
          <ellipse
            cx="74"
            cy="44"
            rx="15"
            ry="7"
            fill="#fff8e8"
            opacity="0.5"
            transform="rotate(18 74 44)"
          />

          {/* 身体 */}
          <circle cx="50" cy="52" r="23" fill="url(#lumi-body)" />

          {/* 眼睛 */}
          <g className="animate-blink" style={{ transformOrigin: '50px 52px' }}>
            <ellipse cx="42.5" cy="50" rx="2.4" ry="3.4" fill="#0d0c0b" opacity="0.82" />
            <ellipse cx="57.5" cy="50" rx="2.4" ry="3.4" fill="#0d0c0b" opacity="0.82" />
          </g>

          {/* 一点点笑意 */}
          <path
            d="M46 59 Q50 62 54 59"
            stroke="#0d0c0b"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
        </svg>
      </div>
    </div>
  )
}
