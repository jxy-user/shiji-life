/**
 * 门厅场景：黄昏里的旧城门
 *
 * 全部用 SVG 绘制，不依赖外部图片素材：
 * 远处未完成的城市、雾、石拱门、微开的木门与门缝里的暖光。
 * 动效（由远及近、浮尘、门开）在外层页面与 index.css 中控制。
 */
export function DoorScene() {
  const motes = [
    { cx: 700, cy: 520, r: 2.2, delay: 0 },
    { cx: 760, cy: 470, r: 1.6, delay: 1.6 },
    { cx: 840, cy: 500, r: 2.6, delay: 0.8 },
    { cx: 900, cy: 560, r: 1.8, delay: 2.4 },
    { cx: 660, cy: 600, r: 1.4, delay: 3.2 },
    { cx: 950, cy: 480, r: 2, delay: 4 },
    { cx: 810, cy: 640, r: 1.5, delay: 1.1 },
    { cx: 730, cy: 690, r: 2.4, delay: 2.9 },
    { cx: 880, cy: 660, r: 1.7, delay: 4.6 },
    { cx: 780, cy: 580, r: 1.2, delay: 3.7 },
  ]

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="door-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04060d" />
          <stop offset="38%" stopColor="#111830" />
          <stop offset="68%" stopColor="#3a2d46" />
          <stop offset="86%" stopColor="#6b4741" />
          <stop offset="100%" stopColor="#2a1c26" />
        </linearGradient>
        <radialGradient id="door-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9bc" stopOpacity="0.95" />
          <stop offset="34%" stopColor="#ffc274" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#e88a45" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#e88a45" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="door-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c4258" />
          <stop offset="45%" stopColor="#2a2f44" />
          <stop offset="100%" stopColor="#171b2b" />
        </linearGradient>
        <linearGradient id="door-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2c1d" />
          <stop offset="55%" stopColor="#261a11" />
          <stop offset="100%" stopColor="#150e08" />
        </linearGradient>
        <linearGradient id="door-gap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e6" />
          <stop offset="40%" stopColor="#ffd692" />
          <stop offset="100%" stopColor="#c57f34" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="door-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd79a" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffb96a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffb96a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="door-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#191e31" />
          <stop offset="45%" stopColor="#0e1220" />
          <stop offset="100%" stopColor="#06080f" />
        </linearGradient>
        <radialGradient id="door-path" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="#f0b46a" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#c98f52" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c98f52" stopOpacity="0" />
        </radialGradient>
        <filter id="door-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="door-blur-md" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="door-blur-lg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="42" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#door-sky)" />

      {/* 远处还没建完的城市 */}
      <g fill="#0c1530" opacity="0.75" filter="url(#door-blur-sm)">
        <path d="M0 560 L0 470 L70 470 L70 430 L150 430 L150 500 L230 500 L230 380 L300 380 L300 470 L380 470 L380 520 L460 520 L460 410 L520 410 L520 560 Z" />
        <path d="M1080 560 L1080 440 L1140 440 L1140 390 L1210 390 L1210 470 L1290 470 L1290 350 L1360 350 L1360 460 L1450 460 L1450 500 L1600 500 L1600 560 Z" />
        <path d="M430 560 L430 500 L500 500 L500 460 L560 460 L560 560 Z" opacity="0.7" />
        <path d="M1020 560 L1020 490 L1080 490 L1080 450 L1140 450 L1140 560 Z" opacity="0.7" />
      </g>
      {/* 城市里零星的暖灯 */}
      <g fill="#ffbf72" opacity="0.5">
        <rect x="120" y="470" width="4" height="4" />
        <rect x="180" y="455" width="3" height="3" />
        <rect x="270" y="405" width="3" height="3" />
        <rect x="420" y="500" width="3" height="3" />
        <rect x="1110" y="450" width="4" height="4" />
        <rect x="1205" y="420" width="3" height="3" />
        <rect x="1330" y="382" width="4" height="4" />
        <rect x="1450" y="480" width="3" height="3" />
      </g>
      <g stroke="#2a3454" strokeWidth="2" opacity="0.35">
        <path d="M250 400 L250 340 M250 360 L270 350 M250 380 L232 372" />
        <path d="M1325 380 L1325 300 M1325 330 L1350 318 M1325 355 L1302 344" />
      </g>

      {/* 雾 */}
      <ellipse cx="800" cy="590" rx="760" ry="120" fill="#8a93c4" opacity="0.10" filter="url(#door-blur-lg)" />
      <ellipse cx="380" cy="620" rx="420" ry="90" fill="#9aa6d6" opacity="0.06" filter="url(#door-blur-lg)" />
      <ellipse cx="1240" cy="610" rx="460" ry="100" fill="#9aa6d6" opacity="0.06" filter="url(#door-blur-lg)" />

      {/* 地面 */}
      <rect y="600" width="1600" height="300" fill="url(#door-ground)" />
      {/* 门前被暖光照亮的一小段路 */}
      <path
        d="M770 900 L790 680 L810 680 L830 900 Z"
        fill="url(#door-path)"
        filter="url(#door-blur-md)"
      />
      <ellipse cx="800" cy="700" rx="210" ry="46" fill="#ffc477" opacity="0.10" filter="url(#door-blur-lg)" />

      {/* 整扇门略微下沉，给标题让出天空 */}
      <g transform="translate(0 34)">
        {/* 门后的暖光 */}
        <ellipse cx="800" cy="520" rx="290" ry="250" fill="url(#door-glow)" opacity="0.9" filter="url(#door-blur-lg)" />

        {/* 门缝投出的光 */}
        <path d="M793 470 L807 470 L968 902 L632 902 Z" fill="url(#door-beam)" opacity="0.5" />

        {/* 石拱门 */}
        <path
          d="M576 690 L576 402 A224 224 0 0 1 1024 402 L1024 690 Z"
          fill="url(#door-stone)"
          stroke="#4d566f"
          strokeOpacity="0.7"
          strokeWidth="3"
        />
        {/* 拱券砌缝 */}
        <path
          d="M604 402 A196 196 0 0 1 996 402"
          fill="none"
          stroke="#565f78"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <g stroke="#151824" strokeOpacity="0.6" strokeWidth="3">
          <path d="M700 202 L700 330" />
          <path d="M740 186 L740 304" />
          <path d="M860 186 L860 304" />
          <path d="M900 202 L900 330" />
          <path d="M612 402 L612 690" />
          <path d="M988 402 L988 690" />
        </g>
        <g stroke="#11141f" strokeOpacity="0.55" strokeWidth="3">
          <path d="M576 470 L648 470" />
          <path d="M576 545 L648 545" />
          <path d="M576 620 L648 620" />
          <path d="M952 470 L1024 470" />
          <path d="M952 545 L1024 545" />
          <path d="M952 620 L1024 620" />
        </g>
        {/* 被门光照到的一侧石面 */}
        <path
          d="M648 690 L648 444 A152 152 0 0 1 800 292 L800 690 Z"
          fill="#ffb96a"
          opacity="0.05"
        />
        <path
          d="M576 690 L576 402 A224 224 0 0 1 800 178"
          fill="none"
          stroke="#f2c48a"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
        {/* 拱顶石 */}
        <path d="M784 178 L816 178 L822 222 L778 222 Z" fill="#3d445c" stroke="#59627c" strokeWidth="2" />

        {/* 内侧门洞 */}
        <path
          d="M648 690 L648 444 A152 152 0 0 1 952 444 L952 690 Z"
          fill="#07070d"
          stroke="#e0ae6c"
          strokeOpacity="0.3"
          strokeWidth="2"
        />

        {/* 两扇微开的木门 */}
        <path
          d="M656 690 L656 446 A146 146 0 0 1 791 444 L791 690 Z"
          fill="url(#door-wood)"
          stroke="#0d0905"
          strokeWidth="3"
        />
        <path
          d="M944 690 L944 446 A146 146 0 0 0 809 444 L809 690 Z"
          fill="url(#door-wood)"
          stroke="#0d0905"
          strokeWidth="3"
        />
        <g stroke="#4a3623" strokeOpacity="0.55" strokeWidth="2">
          <path d="M676 690 L676 460" />
          <path d="M700 690 L700 451" />
          <path d="M724 690 L724 447" />
          <path d="M748 690 L748 445" />
          <path d="M772 690 L772 444" />
          <path d="M924 690 L924 460" />
          <path d="M900 690 L900 451" />
          <path d="M876 690 L876 447" />
          <path d="M852 690 L852 445" />
          <path d="M828 690 L828 444" />
        </g>
        {/* 铁箍 */}
        <g stroke="#1a1a22" strokeWidth="8" opacity="0.7">
          <path d="M660 540 L788 540" />
          <path d="M812 540 L940 540" />
        </g>
        <g fill="#7a5f38" opacity="0.6">
          <circle cx="700" cy="520" r="3.5" />
          <circle cx="772" cy="520" r="3.5" />
          <circle cx="700" cy="610" r="3.5" />
          <circle cx="772" cy="610" r="3.5" />
          <circle cx="900" cy="520" r="3.5" />
          <circle cx="828" cy="520" r="3.5" />
          <circle cx="900" cy="610" r="3.5" />
          <circle cx="828" cy="610" r="3.5" />
        </g>

        {/* 门缝 */}
        <rect x="791" y="444" width="18" height="246" fill="url(#door-gap)" />
        <ellipse cx="800" cy="520" rx="44" ry="150" fill="#ffe4a8" opacity="0.28" filter="url(#door-blur-sm)" />

        {/* 台阶 */}
        <path d="M604 690 L996 690 L1028 728 L572 728 Z" fill="#262c42" />
        <path d="M572 728 L1028 728 L1062 778 L538 778 Z" fill="#1e2338" />
        <path d="M538 778 L1062 778 L1092 836 L508 836 Z" fill="#161a2b" />
        <g stroke="#e8b273" strokeOpacity="0.16" strokeWidth="2">
          <path d="M604 690 L996 690" />
          <path d="M572 728 L1028 728" />
          <path d="M538 778 L1062 778" />
        </g>
        {/* 门光落在台阶上的暖色 */}
        <path
          d="M690 728 L910 728 L986 836 L614 836 Z"
          fill="#ffb96a"
          opacity="0.07"
          filter="url(#door-blur-md)"
        />

        {/* 门框上的藤蔓 */}
        <g stroke="#33503f" strokeWidth="3" fill="none" opacity="0.75">
          <path d="M624 690 C616 620 630 570 622 510 C618 478 626 454 642 438" />
          <path d="M976 690 C984 630 970 582 978 530 C982 496 974 466 960 448" />
        </g>
        <g fill="#41624e" opacity="0.6">
          <ellipse cx="628" cy="630" rx="10" ry="4" transform="rotate(-24 628 630)" />
          <ellipse cx="620" cy="570" rx="11" ry="4" transform="rotate(18 620 570)" />
          <ellipse cx="630" cy="518" rx="9" ry="4" transform="rotate(-12 630 518)" />
          <ellipse cx="972" cy="626" rx="10" ry="4" transform="rotate(20 972 626)" />
          <ellipse cx="980" cy="566" rx="11" ry="4" transform="rotate(-16 980 566)" />
          <ellipse cx="970" cy="514" rx="9" ry="4" transform="rotate(14 970 514)" />
        </g>
      </g>

      {/* 门前贴地的一层薄雾 */}
      <ellipse cx="800" cy="790" rx="520" ry="58" fill="#a7b4de" opacity="0.05" filter="url(#door-blur-lg)" />

      {/* 浮尘 */}
      <g fill="#ffdca8">
        {motes.map((mote) => (
          <circle
            key={`${mote.cx}-${mote.cy}`}
            className="door-mote"
            cx={mote.cx}
            cy={mote.cy}
            r={mote.r}
            opacity="0.55"
            style={{ animationDelay: `${mote.delay}s` }}
          />
        ))}
      </g>
    </svg>
  )
}
