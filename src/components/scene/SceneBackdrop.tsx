import type { SceneId } from '@/game/saveSchema'

/**
 * 场景背景插画
 *
 * MVP 阶段用 SVG 现场绘制，不依赖图片素材：加载快、可缩放、可复用同一套色板。
 * 后续替换为正式插画时，只需保持组件接口不变。
 */
export function SceneBackdrop({ scene }: { scene: SceneId }) {
  const art = {
    plaza: <PlazaArt />,
    home: <HomeArt />,
    campus: <CampusArt />,
    park: <ParkArt />,
  }[scene]

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 900 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {art}
      </svg>
      <div className="paper-grain absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-transparent to-cream-50/40" />
    </div>
  )
}

function PlazaArt() {
  return (
    <>
      <defs>
        <linearGradient id="plaza-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0c0b" />
          <stop offset="60%" stopColor="#171512" />
          <stop offset="100%" stopColor="#1a1713" />
        </linearGradient>
        <radialGradient id="plaza-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a25a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c9a25a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="900" height="600" fill="url(#plaza-sky)" />
      <circle cx="720" cy="130" r="150" fill="url(#plaza-sun)" />

      {/* 远处的城 */}
      <g opacity="0.5">
        <rect x="60" y="250" width="90" height="150" rx="6" fill="#2e2a24" />
        <rect x="170" y="285" width="70" height="115" rx="6" fill="#1d1a16" />
        <rect x="660" y="240" width="110" height="160" rx="6" fill="#2e2a24" />
        <rect x="790" y="270" width="70" height="130" rx="6" fill="#1d1a16" />
        <path d="M105 250 v-26 h3 v26 M715 240 v-34 h3 v34" stroke="#7d7669" strokeWidth="3" />
      </g>

      {/* 地面 */}
      <path d="M0 400 H900 V600 H0 Z" fill="#23201b" />
      <ellipse cx="470" cy="470" rx="330" ry="92" fill="#171512" />
      <ellipse
        cx="470"
        cy="470"
        rx="330"
        ry="92"
        fill="none"
        stroke="#3a332a"
        strokeWidth="1.5"
        strokeDasharray="14 12"
      />

      {/* 老树 */}
      <g>
        <path d="M150 470 q-6 -90 8 -150 l14 2 q-12 62 -4 148 z" fill="#1d1a16" />
        <circle cx="150" cy="270" r="86" fill="#2a3a32" />
        <circle cx="96" cy="300" r="58" fill="#283a30" />
        <circle cx="204" cy="304" r="54" fill="#202e26" />
        <circle cx="150" cy="240" r="48" fill="#2f4038" opacity="0.8" />
      </g>

      {/* 长椅 */}
      <g fill="#1d1a16">
        <rect x="690" y="452" width="150" height="12" rx="5" />
        <rect x="690" y="472" width="150" height="8" rx="4" opacity="0.8" />
        <rect x="700" y="482" width="8" height="26" rx="3" />
        <rect x="820" y="482" width="8" height="26" rx="3" />
      </g>

      {/* 路灯 */}
      <g stroke="#7d7669" strokeWidth="3" fill="none">
        <path d="M330 470 v-120" />
        <path d="M330 350 q0 -14 16 -14" />
      </g>
      <circle cx="350" cy="338" r="10" fill="#e0c08a" opacity="0.9" />
      <circle cx="350" cy="338" r="24" fill="#c9a25a" opacity="0.25" />

      {/* 零散的人影 */}
      <g fill="#a39b8d" opacity="0.28">
        <rect x="520" y="430" width="14" height="34" rx="7" />
        <circle cx="527" cy="422" r="8" />
        <rect x="596" y="438" width="13" height="30" rx="6" />
        <circle cx="602" cy="431" r="7" />
      </g>
    </>
  )
}

function HomeArt() {
  return (
    <>
      <defs>
        <linearGradient id="home-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#171512" />
          <stop offset="100%" stopColor="#1a1713" />
        </linearGradient>
        <radialGradient id="home-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a25a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c9a25a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="900" height="600" fill="url(#home-wall)" />
      <rect y="430" width="900" height="170" fill="#1a1713" />
      <rect y="426" width="900" height="6" fill="#3a332a" />

      {/* 窗 */}
      <rect x="540" y="90" width="250" height="200" rx="10" fill="#1e2a22" />
      <rect
        x="540"
        y="90"
        width="250"
        height="200"
        rx="10"
        fill="none"
        stroke="#0d0c0b"
        strokeWidth="6"
      />
      <path d="M665 90 v200 M540 190 h250" stroke="#0d0c0b" strokeWidth="4" />
      <g stroke="#202e26" strokeWidth="2" opacity="0.65">
        <path d="M570 110 l-14 46 M610 108 l-18 58 M655 112 l-12 40 M700 106 l-16 52 M748 110 l-12 44" />
      </g>
      <rect x="525" y="70" width="18" height="230" rx="8" fill="#2e2a24" opacity="0.7" />
      <rect x="787" y="70" width="18" height="230" rx="8" fill="#2e2a24" opacity="0.7" />

      {/* 床 */}
      <g>
        <rect x="70" y="380" width="230" height="90" rx="12" fill="#283a30" />
        <rect x="70" y="360" width="60" height="60" rx="10" fill="#203428" />
        <rect x="70" y="466" width="230" height="14" rx="6" fill="#0d0c0b" />
      </g>

      {/* 书桌与灯 */}
      <rect x="430" y="380" width="330" height="16" rx="4" fill="#3a2d18" />
      <rect x="444" y="396" width="12" height="90" rx="3" fill="#1d1a16" />
      <rect x="734" y="396" width="12" height="90" rx="3" fill="#1d1a16" />
      <circle cx="678" cy="330" r="70" fill="url(#home-lamp)" />
      <path d="M678 380 v-26" stroke="#1d1a16" strokeWidth="4" />
      <path d="M656 336 h44 l-10 -26 h-24 z" fill="#e0c08a" stroke="#d9a45a" strokeWidth="2" />

      {/* 桌上的信 */}
      <g transform="rotate(-4 520 372)">
        <rect x="478" y="360" width="86" height="20" rx="2" fill="#e8dcc0" stroke="#3a332a" />
        <path d="M486 368 h60" stroke="#3a332a" strokeWidth="2" />
      </g>

      {/* 绿植 */}
      <g>
        <path d="M300 470 h54 l-8 -40 h-38 z" fill="#5a4726" />
        <path d="M327 430 q-2 -50 0 -70 M327 400 q-26 -18 -32 -44 M327 408 q26 -20 30 -48" stroke="#e8dcc0" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    </>
  )
}

function CampusArt() {
  return (
    <>
      <defs>
        <linearGradient id="campus-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0c0b" />
          <stop offset="100%" stopColor="#1a1713" />
        </linearGradient>
      </defs>

      <rect width="900" height="600" fill="url(#campus-sky)" />
      <rect y="430" width="900" height="170" fill="#1d1a16" />

      {/* 主楼 */}
      <rect x="180" y="120" width="540" height="310" rx="8" fill="#2e2a24" />
      <rect x="180" y="120" width="540" height="310" rx="8" fill="none" stroke="#2e2a24" strokeWidth="3" />
      <path d="M160 120 h580 l-20 -34 h-540 z" fill="#2e2a24" />
      <circle cx="450" cy="120" r="26" fill="#171512" stroke="#d9a45a" strokeWidth="3" />
      <path d="M450 120 v-14 M450 120 h10" stroke="#1d1a16" strokeWidth="3" strokeLinecap="round" />

      {/* 窗户 */}
      <g fill="#171512" stroke="#2e2a24" strokeWidth="2">
        {[0, 1, 2, 3, 4, 5].map((col) =>
          [0, 1].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={214 + col * 82}
              y={166 + row * 92}
              width={50}
              height={60}
              rx="4"
            />
          )),
        )}
      </g>
      <g opacity="0.35" fill="#e8dcc0">
        <rect x="214" y="166" width="50" height="60" rx="4" />
        <rect x="378" y="258" width="50" height="60" rx="4" />
        <rect x="542" y="166" width="50" height="60" rx="4" />
      </g>

      {/* 门与台阶 */}
      <rect x="410" y="330" width="80" height="100" rx="6" fill="#0d0c0b" />
      <rect x="390" y="430" width="120" height="12" rx="3" fill="#2e2a24" />
      <rect x="372" y="442" width="156" height="12" rx="3" fill="#3a332a" />

      {/* 两棵树 */}
      <g>
        <rect x="118" y="380" width="12" height="80" rx="4" fill="#1d1a16" />
        <circle cx="124" cy="340" r="62" fill="#2a3a32" />
        <circle cx="86" cy="360" r="38" fill="#283a30" />
      </g>
      <g>
        <rect x="782" y="396" width="11" height="70" rx="4" fill="#1d1a16" />
        <circle cx="788" cy="358" r="52" fill="#202e26" />
      </g>

      {/* 路 */}
      <path d="M360 470 q140 -40 300 0" stroke="#2e2a24" strokeWidth="34" fill="none" strokeLinecap="round" />
    </>
  )
}

function ParkArt() {
  return (
    <>
      <defs>
        <linearGradient id="park-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0c0b" />
          <stop offset="100%" stopColor="#171512" />
        </linearGradient>
        <linearGradient id="park-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#283a30" />
          <stop offset="100%" stopColor="#2a3a32" />
        </linearGradient>
      </defs>

      <rect width="900" height="600" fill="url(#park-sky)" />
      <rect y="360" width="900" height="240" fill="#1b2620" />

      {/* 池塘 */}
      <ellipse cx="470" cy="450" rx="360" ry="110" fill="url(#park-water)" />
      <g stroke="#171512" strokeWidth="2" opacity="0.7" strokeLinecap="round">
        <path d="M220 436 h70 M330 470 h110 M470 420 h80 M600 462 h90" />
      </g>

      {/* 树 */}
      <g>
        <path d="M110 420 q-4 -70 6 -120 l12 2 q-8 52 -2 118 z" fill="#1d1a16" />
        <circle cx="118" cy="270" r="74" fill="#2a3a32" />
        <circle cx="72" cy="300" r="46" fill="#2f4038" />
        <circle cx="166" cy="296" r="42" fill="#202e26" />
      </g>
      <g>
        <path d="M790 430 q-4 -56 5 -96 l11 2 q-7 42 -1 94 z" fill="#1d1a16" />
        <circle cx="798" cy="316" r="58" fill="#202e26" />
        <circle cx="756" cy="338" r="36" fill="#283a30" />
      </g>

      {/* 小路 */}
      <path
        d="M0 520 q180 -60 360 -40 q200 22 540 -30"
        stroke="#23201b"
        strokeWidth="46"
        fill="none"
        opacity="0.9"
      />

      {/* 长椅 */}
      <g fill="#1d1a16">
        <rect x="470" y="500" width="130" height="11" rx="5" />
        <rect x="480" y="511" width="7" height="24" rx="3" />
        <rect x="584" y="511" width="7" height="24" rx="3" />
      </g>

      {/* 鸭子 */}
      <g fill="#7d7669" opacity="0.7">
        <ellipse cx="360" cy="452" rx="14" ry="8" />
        <circle cx="372" cy="444" r="5" />
        <ellipse cx="410" cy="480" rx="11" ry="6" />
        <circle cx="419" cy="474" r="4" />
      </g>
    </>
  )
}
