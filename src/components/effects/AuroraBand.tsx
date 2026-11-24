import { useState } from 'react'

import SoftAurora from './SoftAurora'

function canRenderAurora() {
  if (typeof window === 'undefined') return false
  if (typeof WebGL2RenderingContext === 'undefined') return false
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * 人生线顶部的氛围光。
 *
 * 只有浏览器支持 WebGL2 且未开启“减少动态效果”时才挂载极光；
 * 其余情况保留同一层的静态暖光渐变，观感一致但不消耗 GPU。
 */
export function AuroraBand() {
  const [enhanced] = useState(canRenderAurora)

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[54vh] overflow-hidden opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-14%,rgba(214,169,94,0.30),transparent_66%),radial-gradient(ellipse_at_72%_2%,rgba(138,122,82,0.12),transparent_60%)]" />
      {enhanced ? (
        <div className="absolute inset-0">
          <SoftAurora
            speed={0.25}
            scale={1.4}
            brightness={0.7}
            opacity={0.6}
            color1="#e6b56a"
            color2="#8a7a55"
            noiseFrequency={2}
            noiseAmplitude={0.7}
            bandHeight={0.22}
            bandSpread={2.4}
            spectrum={0.25}
            colorSpeed={0.4}
            enableMouseInteraction
            mouseInfluence={0.08}
            intro
          />
        </div>
      ) : null}
    </div>
  )
}
