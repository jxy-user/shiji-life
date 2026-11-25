/**
 * 门厅场景：黄昏里的旧城门
 *
 * 全部用 SVG 绘制，不依赖外部图片素材。
 * 层次：天空与星 → 远近三层城市 → 两侧塔楼框景 → 雾 → 地面石板 →
 * 石拱门（拱石/壁柱/门楣雕饰）→ 木门（镶板/木纹/铁件/门环）→
 * 门缝主光与体积光 → 台阶与地面光斑 → 暗角 → 浮尘。
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

  // 拱券分块：13 块拱石沿半圆均分
  const voussoirs = Array.from({ length: 13 }, (_, index) => -90 + (index + 0.5) * (180 / 13))

  // 城市窗户灯：中景更密，远景更疏
  const cityLights = [
    [88, 512], [132, 498], [176, 520], [214, 486], [262, 508],
    [318, 470], [356, 492], [402, 512], [448, 480], [486, 504],
    [1114, 500], [1158, 478], [1202, 502], [1246, 466], [1288, 490],
    [1332, 458], [1376, 482], [1420, 500], [1466, 472], [1510, 494],
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
          <stop offset="0%" stopColor="#03050c" />
          <stop offset="30%" stopColor="#0b1226" />
          <stop offset="60%" stopColor="#2c2440" />
          <stop offset="82%" stopColor="#6b4741" />
          <stop offset="100%" stopColor="#241922" />
        </linearGradient>

        <radialGradient id="door-glow-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffaf0" stopOpacity="0.98" />
          <stop offset="38%" stopColor="#ffe0a0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffb45e" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="door-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#464d67" />
          <stop offset="40%" stopColor="#2f3550" />
          <stop offset="100%" stopColor="#181c2e" />
        </linearGradient>
        <linearGradient id="door-stone-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#333952" />
          <stop offset="100%" stopColor="#131725" />
        </linearGradient>
        <linearGradient id="door-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3624" />
          <stop offset="45%" stopColor="#2c1e13" />
          <stop offset="100%" stopColor="#140d07" />
        </linearGradient>
        <linearGradient id="door-wood-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2c1c" />
          <stop offset="100%" stopColor="#1d130a" />
        </linearGradient>
        <linearGradient id="door-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9b8a6f" />
          <stop offset="45%" stopColor="#5c5140" />
          <stop offset="100%" stopColor="#2a2620" />
        </linearGradient>
        <linearGradient id="door-gap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="45%" stopColor="#ffe1a4" />
          <stop offset="100%" stopColor="#c57f34" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="door-ray-main" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e6" stopOpacity="0.9" />
          <stop offset="38%" stopColor="#ffd79a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffb45e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="door-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2036" />
          <stop offset="45%" stopColor="#0d1120" />
          <stop offset="100%" stopColor="#05070e" />
        </linearGradient>
        <radialGradient id="door-path" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#f6c078" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#c98f52" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c98f52" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="door-vignette" cx="50%" cy="44%" r="76%">
          <stop offset="52%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>

        <filter id="door-blur-sm" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="door-blur-md" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="door-blur-lg" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="44" />
        </filter>
        <filter id="door-stone-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
          <feComponentTransfer in="gray" result="faint">
            <feFuncA type="linear" slope="0.16" />
          </feComponentTransfer>
          <feComposite in="faint" in2="SourceGraphic" operator="in" />
        </filter>

        {/* 石材浮雕：噪声 + 定向光，产生凹凸明暗 */}
        <filter id="door-stone-relief" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="7" result="noise" />
          <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="2.2" diffuseConstant="1" result="relief">
            <feDistantLight azimuth="230" elevation="56" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="relief" operator="arithmetic" k1="0.9" k2="0.1" k3="0" k4="0" />
        </filter>

        {/* 木纹浮雕：横向细密纹理 */}
        <filter id="door-wood-relief" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.16" numOctaves="3" seed="3" result="grain" />
          <feDiffuseLighting in="grain" lighting-color="#ffffff" surfaceScale="1.1" diffuseConstant="1" result="relief">
            <feDistantLight azimuth="200" elevation="64" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="relief" operator="arithmetic" k1="0.85" k2="0.15" k3="0" k4="0" />
        </filter>

        {/* 镶板倒角 */}
        <linearGradient id="door-panel-bevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9a7048" stopOpacity="0.4" />
        </linearGradient>

        {/* 地面反光 */}
        <linearGradient id="door-reflection" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd79a" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#c98f52" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c98f52" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* —— 天空与星 —— */}
      <rect width="1600" height="900" fill="url(#door-sky)" />
      <g fill="#c7d2ff">
        {[
          [180, 120, 1.4], [260, 190, 1], [352, 96, 1.2], [470, 168, 0.9],
          [560, 110, 1.3], [690, 74, 1], [820, 132, 1.6], [960, 88, 1.1],
          [1080, 152, 1.2], [1180, 102, 0.9], [1290, 176, 1.4], [1400, 118, 1],
          [1500, 196, 1.1], [96, 236, 0.9], [1462, 252, 0.8], [760, 210, 0.7],
        ].map(([cx, cy, r]) => (
          <circle key={`star-${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity={0.35 + (r % 1) * 0.3} />
        ))}
      </g>
      {/* 薄云 */}
      <ellipse cx="420" cy="260" rx="360" ry="46" fill="#3a3f66" opacity="0.18" filter="url(#door-blur-lg)" />
      <ellipse cx="1180" cy="300" rx="420" ry="54" fill="#3f4168" opacity="0.16" filter="url(#door-blur-lg)" />

      {/* —— 远景城市：三层剪影 —— */}
      <g fill="#0a1124" opacity="0.55" filter="url(#door-blur-sm)">
        <path d="M0 560 L0 486 L58 486 L58 452 L128 452 L128 506 L206 506 L206 396 L268 396 L268 470 L340 470 L340 520 L420 520 L420 430 L486 430 L486 560 Z" />
        <path d="M1118 560 L1118 456 L1178 456 L1178 402 L1248 402 L1248 478 L1320 478 L1320 366 L1382 366 L1382 462 L1452 462 L1452 508 L1600 508 L1600 560 Z" />
      </g>
      {/* 最远的一层城市：更暗、更虚，拉开纵深 */}
      <g fill="#081020" opacity="0.42" filter="url(#door-blur-md)">
        <path d="M0 548 L0 500 L118 500 L118 468 L238 468 L238 512 L356 512 L356 444 L458 444 L458 548 Z" />
        <path d="M1140 548 L1140 488 L1258 488 L1258 454 L1378 454 L1378 502 L1498 502 L1498 468 L1600 468 L1600 548 Z" />
      </g>

      <g fill="#111a33" opacity="0.85">
        <path d="M0 585 L0 520 L74 520 L74 488 L150 488 L150 536 L236 536 L236 470 L304 470 L304 528 L390 528 L390 500 L470 500 L470 585 Z" />
        <path d="M1120 585 L1120 514 L1192 514 L1192 472 L1262 472 L1262 540 L1340 540 L1340 486 L1412 486 L1412 528 L1492 528 L1492 585 Z" />
      </g>
      {/* 城市窗灯 */}
      <g fill="#ffbf72">
        {cityLights.map(([x, y], index) => (
          <rect
            key={`light-${x}-${y}`}
            x={x}
            y={y}
            width={index % 3 === 0 ? 5 : 3.4}
            height={index % 3 === 0 ? 5 : 3.4}
            opacity={0.28 + (index % 4) * 0.12}
            className={index % 3 === 0 ? 'city-window' : undefined}
            style={index % 3 === 0 ? { animationDelay: `${(index % 7) * 0.6}s` } : undefined}
          />
        ))}
      </g>
      {/* 远处天线与塔尖 */}
      <g stroke="#253052" strokeWidth="2" opacity="0.4">
        <path d="M250 470 L250 386 M250 414 L274 400 M250 438 L228 426" />
        <path d="M1350 450 L1350 352 M1350 388 L1378 372 M1350 414 L1324 400" />
        <path d="M740 520 L740 470 L760 470 L760 520" />
      </g>
      {/* 屋顶轮廓：水塔、烟囱、尖顶 */}
      <g stroke="#1c2747" strokeWidth="2" opacity="0.6" fill="none">
        <path d="M300 470 L300 438 M312 470 L312 438 M298 438 h16" />
        <path d="M294 438 L306 428 L318 438" />
        <path d="M420 500 L420 456 M414 456 h12" />
        <path d="M1180 480 L1180 432 M1174 432 h12" />
        <path d="M1360 366 L1382 322 L1404 366" />
        <path d="M236 470 L236 438 L254 424 L272 438 L272 470" />
        <path d="M1040 500 L1040 462 M1034 462 h12" />
      </g>
      {/* 城市灯光映在低空的暖色 */}
      <ellipse cx="300" cy="478" rx="230" ry="62" fill="#ffbf72" opacity="0.05" filter="url(#door-blur-lg)" />
      <ellipse cx="1310" cy="478" rx="250" ry="64" fill="#ffbf72" opacity="0.05" filter="url(#door-blur-lg)" />

      {/* —— 两侧塔楼框景 —— */}
      <g filter="url(#door-blur-md)" opacity="0.75">
        <path d="M0 900 L0 250 L40 250 L40 210 L120 210 L120 250 L190 250 L190 320 L250 320 L250 900 Z" fill="#0c1122" />
        <path d="M1600 900 L1600 236 L1552 236 L1552 194 L1470 194 L1470 236 L1396 236 L1396 306 L1340 306 L1340 900 Z" fill="#0c1122" />
      </g>
      {/* 塔楼上的暗窗与砖缝 */}
      <g fill="#ffbf72" opacity="0.35">
        <rect x="66" y="330" width="8" height="12" />
        <rect x="148" y="290" width="8" height="12" />
        <rect x="1446" y="300" width="8" height="12" />
        <rect x="1520" y="340" width="8" height="12" />
      </g>
      <g stroke="#1a2038" strokeWidth="1.6" opacity="0.55">
        <path d="M40 330 L190 330 M40 380 L190 380 M40 430 L250 430 M0 480 L250 480 M0 530 L250 530 M0 580 L250 580" />
        <path d="M1560 330 L1410 330 M1560 380 L1410 380 M1560 430 L1350 430 M1600 480 L1350 480 M1600 530 L1350 530 M1600 580 L1350 580" />
      </g>

      {/* —— 雾：整体静止，两层缓慢漂移 —— */}
      <ellipse cx="800" cy="590" rx="760" ry="120" fill="#8a93c4" opacity="0.1" filter="url(#door-blur-lg)" />
      <g className="door-mist">
        <ellipse cx="380" cy="620" rx="420" ry="90" fill="#9aa6d6" opacity="0.08" filter="url(#door-blur-lg)" />
        <ellipse cx="1240" cy="610" rx="460" ry="100" fill="#9aa6d6" opacity="0.07" filter="url(#door-blur-lg)" />
      </g>

      {/* —— 地面与门前石板路 —— */}
      <rect y="600" width="1600" height="300" fill="url(#door-ground)" />
      <path d="M770 900 L790 680 L810 680 L830 900 Z" fill="url(#door-path)" filter="url(#door-blur-md)" />
      {/* 透视石板缝 */}
      <g stroke="#2b3350" strokeOpacity="0.5" strokeWidth="2">
        <path d="M640 900 L760 700" />
        <path d="M720 900 L780 700" />
        <path d="M880 900 L820 700" />
        <path d="M960 900 L840 700" />
        <path d="M560 900 L740 700" />
        <path d="M1040 900 L860 700" />
      </g>
      <g stroke="#252c46" strokeOpacity="0.45" strokeWidth="2">
        <path d="M560 780 Q800 760 1040 780" />
        <path d="M500 840 Q800 816 1100 840" />
      </g>
      <ellipse cx="800" cy="700" rx="210" ry="46" fill="#ffc477" opacity="0.1" filter="url(#door-blur-lg)" />

      {/* —— 门厅主体 —— */}
      <g transform="translate(0 34)">
        {/* 门缝体积光：光从一条竖缝透出，只向门前方投出一束窄光 */}
        <g style={{ mixBlendMode: 'screen' }}>
          {/* 辉光严格限制在门缝的竖直范围内，不越过缝顶 */}
          <ellipse
            cx="800"
            cy="567"
            rx="22"
            ry="120"
            fill="url(#door-glow-core)"
            opacity="0.3"
            filter="url(#door-blur-sm)"
          />

          {/* 空气里的柔光：只在缝的两侧，竖直范围 */}
          <ellipse
            cx="800"
            cy="560"
            rx="44"
            ry="140"
            fill="url(#door-glow-core)"
            opacity="0.13"
            filter="url(#door-blur-md)"
          />

          {/* 门缝两侧门板被光擦亮的窄边（竖直，不是圆形） */}
          <rect x="781" y="446" width="8" height="244" fill="url(#door-gap)" opacity="0.2" filter="url(#door-blur-sm)" />
          <rect x="811" y="446" width="8" height="244" fill="url(#door-gap)" opacity="0.2" filter="url(#door-blur-sm)" />
          {/* 光从缝里溢到门板上的更宽一层 */}
          <rect x="770" y="450" width="19" height="236" fill="url(#door-gap)" opacity="0.08" filter="url(#door-blur-md)" />
          <rect x="811" y="450" width="19" height="236" fill="url(#door-gap)" opacity="0.08" filter="url(#door-blur-md)" />

          {/* 地面光斑：外圈更宽更淡，模拟衰减 */}
          <path
            d="M776 690 L824 690 L918 900 L682 900 Z"
            fill="url(#door-ray-main)"
            opacity="0.2"
            filter="url(#door-blur-lg)"
          />
          {/* 缝光落在地面的窄光带：只从门底往下，不悬浮在空中 */}
          <path
            d="M790 690 L810 690 L866 900 L734 900 Z"
            fill="url(#door-ray-main)"
            opacity="0.85"
            filter="url(#door-blur-sm)"
          />
          {/* 光带亮核 */}
          <path
            d="M795 690 L805 690 L822 900 L778 900 Z"
            fill="url(#door-ray-main)"
            opacity="0.4"
            filter="url(#door-blur-sm)"
          />
        </g>

        {/* 门楣与雕饰 */}
        <rect x="500" y="330" width="600" height="30" rx="4" fill="url(#door-stone-dark)" stroke="#4d566f" strokeOpacity="0.5" strokeWidth="2" />
        <rect x="516" y="300" width="568" height="30" rx="3" fill="#252b40" stroke="#4a536c" strokeOpacity="0.4" strokeWidth="2" />
        <g stroke="#5b647e" strokeOpacity="0.35" strokeWidth="2">
          <path d="M560 316 L1040 316" />
          <path d="M600 344 L1000 344" />
        </g>
        {/* 中央菱形雕饰 */}
        <g transform="translate(800 278)">
          <path d="M0 -26 L20 0 L0 26 L-20 0 Z" fill="#2c334a" stroke="#6a7390" strokeOpacity="0.55" strokeWidth="2" />
          <path d="M0 -12 L9 0 L0 12 L-9 0 Z" fill="#131726" />
          <circle cx="0" cy="0" r="4" fill="#ffd79a" opacity="0.22" />
        </g>

        {/* 两侧壁柱 */}
        <g>
          <rect x="520" y="360" width="60" height="330" fill="url(#door-stone)" stroke="#4d566f" strokeOpacity="0.45" strokeWidth="2" />
          <rect x="1020" y="360" width="60" height="330" fill="url(#door-stone)" stroke="#4d566f" strokeOpacity="0.45" strokeWidth="2" />
          {/* 柱头 */}
          <path d="M508 360 L592 360 L584 386 L516 386 Z" fill="#3a4158" stroke="#59627c" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M1008 360 L1092 360 L1084 386 L1016 386 Z" fill="#3a4158" stroke="#59627c" strokeOpacity="0.5" strokeWidth="2" />
          {/* 柱头回纹 */}
          <g stroke="#6a7390" strokeOpacity="0.3" strokeWidth="1.4" fill="none">
            <path d="M520 373 q8 -6 16 0 q-8 6 -16 0" />
            <path d="M1020 373 q8 -6 16 0 q-8 6 -16 0" />
            <path d="M548 373 q8 -6 16 0 q-8 6 -16 0" />
            <path d="M1048 373 q8 -6 16 0 q-8 6 -16 0" />
          </g>
          {/* 柱础 */}
          <path d="M512 690 L588 690 L596 714 L504 714 Z" fill="#262c42" stroke="#4a536c" strokeOpacity="0.45" strokeWidth="2" />
          <path d="M1012 690 L1088 690 L1096 714 L1004 714 Z" fill="#262c42" stroke="#4a536c" strokeOpacity="0.45" strokeWidth="2" />
          {/* 柱身凹槽 */}
          <g stroke="#1a1f30" strokeOpacity="0.6" strokeWidth="2">
            <path d="M536 392 L536 682" />
            <path d="M552 392 L552 682" />
            <path d="M568 392 L568 682" />
            <path d="M1032 392 L1032 682" />
            <path d="M1048 392 L1048 682" />
            <path d="M1064 392 L1064 682" />
          </g>
        </g>

        {/* 石拱门：外沿 + 拱石环 */}
        <path
          d="M560 690 L560 402 A240 240 0 0 1 1040 402 L1040 690 Z"
          fill="url(#door-stone-dark)"
          stroke="#4d566f"
          strokeOpacity="0.55"
          strokeWidth="3"
        />
        <path
          d="M576 402 A224 224 0 0 1 1024 402 L996 402 A196 196 0 0 0 604 402 Z"
          fill="url(#door-stone)"
          stroke="#5a637d"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
        {/* 石面浮雕光照：凹凸、斑驳 */}
        <path
          d="M560 690 L560 402 A240 240 0 0 1 1040 402 L1040 690 Z"
          fill="#8b93ab"
          opacity="0.6"
          filter="url(#door-stone-relief)"
          style={{ mixBlendMode: 'soft-light' }}
        />
        {/* 拱石分块 */}
        <g stroke="#0f1320" strokeOpacity="0.65" strokeWidth="2.4">
          {voussoirs.map((angle) => (
            <line
              key={`voussoir-${angle}`}
              x1="800"
              y1="178"
              x2="800"
              y2="206"
              transform={`rotate(${angle} 800 402)`}
            />
          ))}
        </g>
        {/* 拱顶的受光边缘 */}
        <path
          d="M576 402 A224 224 0 0 1 1024 402"
          fill="none"
          stroke="#ffd79a"
          strokeOpacity="0.16"
          strokeWidth="5"
          filter="url(#door-blur-sm)"
        />

        {/* 拱石上的亮边（被门光照到） */}
        {voussoirs.slice(0, 7).map((angle) => (
          <line
            key={`voussoir-light-${angle}`}
            x1="800"
            y1="180"
            x2="800"
            y2="204"
            stroke="#f2c48a"
            strokeOpacity="0.14"
            strokeWidth="1.4"
            transform={`rotate(${angle} 800 402)`}
          />
        ))}

        {/* 内侧门洞 */}
        <path
          d="M648 690 L648 444 A152 152 0 0 1 952 444 L952 690 Z"
          fill="#05050a"
          stroke="#e0ae6c"
          strokeOpacity="0.32"
          strokeWidth="2"
        />
        {/* 两扇木门 */}
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
        {/* 木纹浮雕：板面的起伏与纹理 */}
        <path
          d="M656 690 L656 446 A146 146 0 0 1 791 444 L791 690 Z"
          fill="#6b4b2e"
          opacity="0.55"
          filter="url(#door-wood-relief)"
          style={{ mixBlendMode: 'soft-light' }}
        />
        <path
          d="M944 690 L944 446 A146 146 0 0 0 809 444 L809 690 Z"
          fill="#6b4b2e"
          opacity="0.55"
          filter="url(#door-wood-relief)"
          style={{ mixBlendMode: 'soft-light' }}
        />

        {/* 木门镶板：左门 */}
        <g stroke="url(#door-panel-bevel)" strokeOpacity="0.9" strokeWidth="2">
          {[
            [668, 470, 56, 54], [732, 470, 50, 54],
            [668, 540, 56, 54], [732, 540, 50, 54],
            [668, 610, 56, 58], [732, 610, 50, 58],
          ].map(([x, y, w, h]) => (
            <rect key={`panel-l-${x}-${y}`} x={x} y={y} width={w} height={h} rx="3" fill="url(#door-wood-panel)" />
          ))}
        </g>
        <g stroke="#6b4d30" strokeOpacity="0.28" strokeWidth="1.4">
          {[
            [672, 475, 48, 44], [736, 475, 42, 44],
            [672, 545, 48, 44], [736, 545, 42, 44],
            [672, 615, 48, 48], [736, 615, 42, 48],
          ].map(([x, y, w, h]) => (
            <rect key={`panel-l-light-${x}-${y}`} x={x} y={y} width={w} height={h} rx="2" fill="none" />
          ))}
        </g>
        {/* 木门镶板：右门 */}
        <g stroke="url(#door-panel-bevel)" strokeOpacity="0.9" strokeWidth="2">
          {[
            [818, 470, 50, 54], [878, 470, 56, 54],
            [818, 540, 50, 54], [878, 540, 56, 54],
            [818, 610, 50, 58], [878, 610, 56, 58],
          ].map(([x, y, w, h]) => (
            <rect key={`panel-r-${x}-${y}`} x={x} y={y} width={w} height={h} rx="3" fill="url(#door-wood-panel)" />
          ))}
        </g>
        <g stroke="#6b4d30" strokeOpacity="0.28" strokeWidth="1.4">
          {[
            [822, 475, 42, 44], [882, 475, 48, 44],
            [822, 545, 42, 44], [882, 545, 48, 44],
            [822, 615, 42, 48], [882, 615, 48, 48],
          ].map(([x, y, w, h]) => (
            <rect key={`panel-r-light-${x}-${y}`} x={x} y={y} width={w} height={h} rx="2" fill="none" />
          ))}
        </g>

        {/* 木纹 */}
        <g stroke="#5a4028" strokeOpacity="0.22" strokeWidth="1.2" fill="none">
          <path d="M664 690 C660 620 668 560 664 500 C662 470 666 452 674 442" />
          <path d="M688 690 C684 620 692 560 688 500 C686 470 690 452 698 442" />
          <path d="M712 690 C708 620 716 560 712 500 C710 470 714 452 722 442" />
          <path d="M760 690 C756 620 764 560 760 500 C758 470 762 452 770 442" />
          <path d="M936 690 C940 620 932 560 936 500 C938 470 934 452 926 442" />
          <path d="M912 690 C916 620 908 560 912 500 C914 470 910 452 902 442" />
          <path d="M888 690 C892 620 884 560 888 500 C890 470 886 452 878 442" />
          <path d="M840 690 C844 620 836 560 840 500 C842 470 838 452 830 442" />
        </g>
        {/* 木门上的划痕 */}
        <g stroke="#a07a52" strokeOpacity="0.24" strokeWidth="0.8">
          <path d="M676 500 L712 512" />
          <path d="M690 560 L726 548" />
          <path d="M884 520 L920 534" />
          <path d="M860 600 L896 588" />
        </g>
        <g stroke="#0a0603" strokeOpacity="0.4" strokeWidth="0.7">
          <path d="M700 620 L724 612" />
          <path d="M866 540 L890 532" />
          <path d="M744 480 L770 476" />
        </g>

        {/* 铁箍 */}
        <g>
          <rect x="656" y="528" width="135" height="14" rx="4" fill="url(#door-metal)" opacity="0.85" stroke="#14110d" strokeWidth="1.5" />
          <rect x="809" y="528" width="135" height="14" rx="4" fill="url(#door-metal)" opacity="0.85" stroke="#14110d" strokeWidth="1.5" />
          <rect x="656" y="632" width="135" height="12" rx="4" fill="url(#door-metal)" opacity="0.7" stroke="#14110d" strokeWidth="1.5" />
          <rect x="809" y="632" width="135" height="12" rx="4" fill="url(#door-metal)" opacity="0.7" stroke="#14110d" strokeWidth="1.5" />
          {/* 铁箍顶部的金属高光 */}
          <rect x="660" y="529" width="127" height="1.5" fill="#d8c49a" opacity="0.3" />
          <rect x="813" y="529" width="127" height="1.5" fill="#d8c49a" opacity="0.3" />
          {/* 铆钉周围的锈迹 */}
          <g fill="#7a4a2a" opacity="0.22">
            {[676, 706, 736, 766, 826, 856, 886, 916].map((x) => (
              <circle key={`rust-${x}`} cx={x} cy={535} r="4.5" />
            ))}
          </g>
          <g fill="#c9b48a" opacity="0.5">
            {[676, 706, 736, 766, 826, 856, 886, 916].map((x) => (
              <circle key={`rivet-${x}`} cx={x} cy={535} r="2.2" />
            ))}
          </g>
        </g>

        {/* 门环 */}
        <g>
          <circle cx="748" cy="588" r="15" fill="none" stroke="url(#door-metal)" strokeWidth="5" />
          <circle cx="748" cy="572" r="6" fill="url(#door-metal)" stroke="#14110d" strokeWidth="1.5" />
          <circle cx="852" cy="588" r="15" fill="none" stroke="url(#door-metal)" strokeWidth="5" />
          <circle cx="852" cy="572" r="6" fill="url(#door-metal)" stroke="#14110d" strokeWidth="1.5" />
        </g>

        {/* 门缝与主光 */}
        {/* 门缝两侧的门板厚度 */}
        <rect x="788" y="444" width="3" height="246" fill="#0a0603" />
        <rect x="809" y="444" width="3" height="246" fill="#0a0603" />
        <rect x="791" y="444" width="18" height="246" fill="url(#door-gap)" />
        <rect x="797" y="452" width="6" height="232" fill="#fffdf6" opacity="0.92" filter="url(#door-blur-sm)" />
        {/* 门缝本身的光晕也限制在缝的高度内 */}
        <ellipse cx="800" cy="567" rx="34" ry="118" fill="#ffe4a8" opacity="0.26" filter="url(#door-blur-sm)" />

        {/* 石面受光的一侧 */}
        <path
          d="M648 690 L648 444 A152 152 0 0 1 800 292 L800 690 Z"
          fill="#ffb96a"
          opacity="0.07"
        />
        <path
          d="M576 690 L576 402 A224 224 0 0 1 800 178"
          fill="none"
          stroke="#f2c48a"
          strokeOpacity="0.2"
          strokeWidth="3"
        />

        {/* 石材颗粒 */}
        <path
          d="M560 690 L560 402 A240 240 0 0 1 1040 402 L1040 690 Z"
          fill="#ffffff"
          opacity="0.35"
          filter="url(#door-stone-grain)"
        />
        {/* 石面上的水渍 */}
        <g fill="#0f1424" opacity="0.16" filter="url(#door-blur-sm)">
          <path d="M600 404 L607 406 L604 566 L598 564 Z" />
          <path d="M622 392 L627 394 L624 524 L619 522 Z" />
          <path d="M988 400 L995 402 L992 552 L986 550 Z" />
          <path d="M1010 406 L1015 408 L1012 502 L1007 500 Z" />
        </g>
        {/* 石拱与壁柱底部的苔痕 */}
        <g filter="url(#door-blur-sm)" opacity="0.32">
          <ellipse cx="580" cy="672" rx="34" ry="12" fill="#2f4a38" />
          <ellipse cx="612" cy="684" rx="22" ry="8" fill="#37583f" />
          <ellipse cx="1008" cy="668" rx="30" ry="11" fill="#2f4a38" />
          <ellipse cx="978" cy="682" rx="20" ry="7" fill="#37583f" />
          <ellipse cx="548" cy="690" rx="18" ry="7" fill="#35523c" />
          <ellipse cx="1052" cy="690" rx="20" ry="7" fill="#35523c" />
        </g>

        {/* 台阶 */}
        <path d="M600 690 L1000 690 L1032 728 L568 728 Z" fill="#2a3048" stroke="#3d445e" strokeOpacity="0.6" strokeWidth="2" />
        <path d="M568 728 L1032 728 L1066 778 L534 778 Z" fill="#212740" stroke="#363d56" strokeOpacity="0.5" strokeWidth="2" />
        <path d="M534 778 L1066 778 L1096 836 L504 836 Z" fill="#181c2e" stroke="#2e3450" strokeOpacity="0.45" strokeWidth="2" />
        {/* 湿石板上的门光倒影 */}
        <path
          d="M780 700 L820 700 L878 900 L722 900 Z"
          fill="url(#door-reflection)"
          opacity="0.22"
          filter="url(#door-blur-md)"
          style={{ mixBlendMode: 'screen' }}
        />
        <g stroke="#e8b273" strokeOpacity="0.2" strokeWidth="2">
          <path d="M600 690 L1000 690" />
          <path d="M568 728 L1032 728" />
          <path d="M534 778 L1066 778" />
        </g>
        {/* 台阶的磨损与裂缝 */}
        <g stroke="#0f1220" strokeOpacity="0.55" strokeWidth="1.2">
          <path d="M700 702 L742 726" />
          <path d="M880 732 L912 776" />
          <path d="M618 784 L662 832" />
          <path d="M982 786 L948 832" />
          <path d="M760 792 L790 830" />
        </g>
        {/* 台阶边缘的磨损缺口 */}
        <g fill="#0f1220" opacity="0.5">
          <path d="M640 690 L660 690 L656 697 L644 697 Z" />
          <path d="M920 728 L944 728 L940 735 L926 735 Z" />
          <path d="M600 778 L628 778 L624 785 L606 785 Z" />
          <path d="M860 778 L884 778 L880 785 L864 785 Z" />
        </g>
        {/* 光落在台阶上 */}
        <path
          d="M690 728 L910 728 L986 836 L614 836 Z"
          fill="#ffb96a"
          opacity="0.09"
          filter="url(#door-blur-md)"
        />
        <ellipse cx="800" cy="792" rx="150" ry="34" fill="#ffcf8a" opacity="0.12" filter="url(#door-blur-md)" />

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

      {/* 门前贴地薄雾 */}
      <ellipse cx="800" cy="790" rx="520" ry="58" fill="#a7b4de" opacity="0.05" filter="url(#door-blur-lg)" />

      {/* 暗角 */}
      <rect width="1600" height="900" fill="url(#door-vignette)" />

      {/* 前景：虚化的门框暗部，拉开景深 */}
      <g filter="url(#door-blur-md)" opacity="0.8">
        <path d="M0 900 L0 640 Q70 660 100 750 Q118 820 126 900 Z" fill="#05070f" />
        <path d="M1600 900 L1600 620 Q1522 650 1492 748 Q1474 820 1466 900 Z" fill="#05070f" />
      </g>
      {/* 前景虚化的大颗尘埃 */}
      <g filter="url(#door-blur-sm)" fill="#ffdca8" opacity="0.22">
        <circle cx="360" cy="640" r="5" />
        <circle cx="1240" cy="700" r="6" />
        <circle cx="480" cy="820" r="4" />
        <circle cx="1120" cy="840" r="5" />
      </g>
      {/* 地面湿反射的波纹 */}
      <g stroke="#ffd79a" strokeOpacity="0.1" strokeWidth="2" fill="none">
        <path d="M762 758 Q800 750 844 758" />
        <path d="M750 812 Q800 800 856 812" />
        <path d="M738 866 Q800 852 868 866" />
      </g>

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

      {/* 光带里被照亮的尘埃：集中在门缝正下方 */}
      <g fill="#fff4d6">
        {[
          [772, 700, 1.4], [800, 760, 1.8], [826, 820, 1.5], [786, 860, 1.9],
          [814, 880, 1.3], [796, 680, 1.1], [808, 720, 1.2], [774, 800, 1.6],
          [830, 848, 1.2], [800, 900, 1.5], [788, 640, 1], [812, 660, 1.1],
        ].map(([cx, cy, r], index) => (
          <circle
            key={`beam-mote-${cx}-${cy}`}
            className="door-mote"
            cx={cx}
            cy={cy}
            r={r}
            opacity={0.55 + (index % 3) * 0.12}
            style={{ animationDelay: `${(index % 5) * 0.9}s` }}
          />
        ))}
      </g>
    </svg>
  )
}
