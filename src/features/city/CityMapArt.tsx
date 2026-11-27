/**
 * 未完成之城 · 测绘档案底图。
 * 纯静态 SVG，不含交互；热点由 CityMap.tsx 以百分比叠加在同一个 canvas 上。
 * 坐标沿用 900×620 制图面（百分比 × 900/620），四周留 48 单位出血，
 * 供点击热点时 scale(1.5) 推近不露白。
 */
export default function CityMapArt() {
  return (
    <svg
      className="city-map-art"
      viewBox="0 0 900 620"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="city-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0H0V30" fill="none" stroke="var(--g-ink)" strokeWidth="0.5" opacity="0.14" />
        </pattern>
        <pattern id="city-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V10" stroke="var(--g-ink)" strokeWidth="1.6" opacity="0.5" />
        </pattern>
        <pattern id="city-water" width="34" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7h13M21 7h13" stroke="var(--g-ink)" strokeWidth="1.2" opacity="0.28" />
        </pattern>
        <g id="city-tree">
          <circle cx="0" cy="-7" r="7" fill="var(--g-grass)" stroke="var(--g-ink)" strokeWidth="2" />
          <circle cx="-6" cy="0" r="6" fill="var(--g-grass)" stroke="var(--g-ink)" strokeWidth="2" />
          <circle cx="6" cy="2" r="6" fill="var(--g-grass)" stroke="var(--g-ink)" strokeWidth="2" />
          <path d="M0 6v7" stroke="var(--g-ink)" strokeWidth="2" />
        </g>
      </defs>

      {/* 纸底 + 测绘网格 */}
      <rect x="-48" y="-48" width="996" height="716" fill="var(--g-paper-deep)" />
      <rect x="-48" y="-48" width="996" height="716" fill="url(#city-grid)" />

      {/* 绿地与公园 */}
      <g className="city-map-green">
        <path d="M118 210h168v196H118z" fill="var(--g-grass)" opacity="0.55" stroke="var(--g-ink)" strokeWidth="2" />
        <path d="M690 30h190v170H690z" fill="var(--g-grass)" opacity="0.4" stroke="var(--g-ink)" strokeWidth="2" />
        <path d="M660 470h182v128H660z" fill="var(--g-grass)" opacity="0.4" stroke="var(--g-ink)" strokeWidth="2" />
        <path d="M138 236c26-20 68-20 92 2s18 60-6 78-70 14-90-8-16-52 4-72z" fill="var(--g-sky)" stroke="var(--g-ink)" strokeWidth="2" />
      </g>

      {/* 河流 */}
      <path
        d="M620 -20C560 94 690 154 638 264S508 448 610 650"
        fill="none"
        stroke="var(--g-sky)"
        strokeWidth="116"
      />
      <path
        d="M620 -20C560 94 690 154 638 264S508 448 610 650"
        fill="none"
        stroke="url(#city-water)"
        strokeWidth="116"
      />
      <path
        d="M620 -20C560 94 690 154 638 264S508 448 610 650"
        fill="none"
        stroke="var(--g-ink)"
        strokeWidth="2.5"
      />

      {/* 道路：主干（纸底宽描边 + 墨色细边 + 虚线中心线） */}
      <g className="city-map-arterial">
        <path
          d="M-120 460C170 404 263 458 403 420S604 353 1000 402"
          fill="none"
          stroke="var(--g-paper-light)"
          strokeWidth="48"
        />
        <path
          d="M-120 460C170 404 263 458 403 420S604 353 1000 402"
          fill="none"
          stroke="var(--g-ink)"
          strokeWidth="46"
          strokeOpacity="0"
        />
        <path
          d="M-120 460C170 404 263 458 403 420S604 353 1000 402"
          fill="none"
          stroke="var(--g-ink)"
          strokeWidth="3"
          strokeDasharray="20 12"
        />
        <path d="M318 -120C350 100 302 206 364 318S506 470 470 720" fill="none" stroke="var(--g-paper-light)" strokeWidth="34" />
        <path d="M318 -120C350 100 302 206 364 318S506 470 470 720" fill="none" stroke="var(--g-ink)" strokeWidth="2.5" strokeDasharray="18 11" />
        <path d="M92 -120C136 110 98 220 166 314S284 476 272 720" fill="none" stroke="var(--g-paper-light)" strokeWidth="28" />
        <path d="M92 -120C136 110 98 220 166 314S284 476 272 720" fill="none" stroke="var(--g-ink)" strokeWidth="2.5" strokeDasharray="16 10" />
      </g>

      {/* 次干道与巷道 */}
      <g className="city-map-lanes" fill="none" stroke="var(--g-ink)" strokeWidth="1.6" strokeDasharray="9 8" opacity="0.7">
        <path d="M470 -20C486 120 452 220 500 320S560 470 540 640" />
        <path d="M60 150C220 128 340 150 460 118S700 96 880 122" />
        <path d="M60 560C240 540 380 566 560 540S780 512 940 540" />
        <path d="M180 -20C196 90 168 160 210 250" />
      </g>

      {/* 街区地块 */}
      <g className="city-map-blocks" fill="var(--g-paper)" stroke="var(--g-ink)" strokeWidth="2">
        <path d="M256 46h120v100H256z" />
        <path d="M428 48h104v95H428z" />
        <path d="M270 162h100v100H270z" />
        <path d="M432 186h100v100H432z" />
        <path d="M88 150h112v104H88z" />
        <path d="M602 32h92v92h-92z" />
        <path d="M748 226h104v84H748z" />
        <path d="M674 302h104v84H674z" />
        <path d="M560 500h100v88H560z" />
        <path d="M360 364h124v94H360z" />
        <path d="M300 510h98v82h-98z" />
        <path d="M40 40h96v64H40z" />
        <path d="M64 470h92v70H64z" />
        <path d="M180 486h54v52h-54z" />
      </g>
      <g className="city-map-blocks-hatched" fill="url(#city-hatch)" stroke="var(--g-ink)" strokeWidth="2">
        <path d="M470 120h70v58h-70z" />
        <path d="M190 340h56v60h-56z" />
        <path d="M620 210h58v52h-58z" />
        <path d="M152 46h44v40h-44z" />
      </g>

      {/* 街区编号 */}
      <g fill="var(--g-ink-soft)" fontFamily="var(--g-font-mono)" fontSize="10" textAnchor="middle">
        <text x="316" y="100">01</text>
        <text x="480" y="100">02</text>
        <text x="320" y="216">03</text>
        <text x="482" y="240">04</text>
        <text x="144" y="206">05</text>
        <text x="648" y="82">06</text>
        <text x="800" y="272">07</text>
        <text x="726" y="348">08</text>
        <text x="610" y="548">09</text>
        <text x="422" y="416">10</text>
        <text x="349" y="556">11</text>
      </g>

      {/* 树符号 */}
      <g className="city-map-trees">
        <use href="#city-tree" x="150" y="248" />
        <use href="#city-tree" x="196" y="300" />
        <use href="#city-tree" x="256" y="262" />
        <use href="#city-tree" x="230" y="360" />
        <use href="#city-tree" x="158" y="368" />
        <use href="#city-tree" x="700" y="70" />
        <use href="#city-tree" x="760" y="110" />
        <use href="#city-tree" x="700" y="500" />
        <use href="#city-tree" x="760" y="540" />
        <use href="#city-tree" x="588" y="176" />
        <use href="#city-tree" x="332" y="132" />
      </g>

      {/* 地标：广场环岛 + 钟塔 */}
      <g className="city-map-plaza">
        <circle cx="468" cy="267" r="74" fill="var(--g-sun)" stroke="var(--g-ink)" strokeWidth="4" />
        <circle cx="468" cy="267" r="74" fill="none" stroke="var(--g-ink)" strokeWidth="1.5" strokeDasharray="8 7" />
        <circle cx="468" cy="267" r="31" fill="var(--g-paper-light)" stroke="var(--g-ink)" strokeWidth="3" />
        <path d="M468 193v148M394 267h148M416 215l104 104M520 215L416 319" stroke="var(--g-ink)" strokeWidth="2" opacity="0.6" />
        {/* 当前所在：环岛外圈的红色定位环 + 十字刻度，与页脚图例一致 */}
        <circle cx="468" cy="267" r="94" fill="none" stroke="var(--g-signal)" strokeWidth="3" strokeDasharray="3 9" />
        <path d="M468 173v-16M468 361v16M374 267h-16M562 267h16" stroke="var(--g-signal)" strokeWidth="3" />
      </g>

      {/* 地标：校园跑道 + 钟楼 */}
      <g className="city-map-school">
        <ellipse cx="630" cy="112" rx="52" ry="30" fill="none" stroke="var(--g-signal-deep)" strokeWidth="4" />
        <ellipse cx="630" cy="112" rx="34" ry="16" fill="var(--g-grass)" opacity="0.6" stroke="var(--g-ink)" strokeWidth="2" />
        <path d="M672 78h14v20h-14z" fill="var(--g-ink)" />
      </g>

      {/* 地标：街区商铺排 + 遮阳篷 */}
      <g className="city-map-shops">
        <path d="M756 226v-14h18v14zM784 226v-14h18v14zM812 226v-14h18v14z" fill="var(--g-signal)" stroke="var(--g-ink)" strokeWidth="1.5" />
      </g>

      {/* 地标：工作室锯齿屋顶 */}
      <g className="city-map-studio" fill="var(--g-paper-deep)" stroke="var(--g-ink)" strokeWidth="2">
        <path d="M368 364l20-16 20 16 20-16 20 16 20-16v12l-20 16-20-16-20 16-20-16z" />
        <path d="M368 476v18h16v-18zM432 476v18h16v-18z" />
      </g>

      {/* 地标：港口栈桥 + 船 */}
      <g className="city-map-harbor">
        <path d="M614 424h64v10h-64zM614 448h64v10h-64z" fill="var(--g-paper-light)" stroke="var(--g-ink)" strokeWidth="2" />
        <path d="M636 404l26 8-26 8zM636 468l26-8-26-8z" fill="var(--g-signal-deep)" stroke="var(--g-ink)" strokeWidth="1.5" />
      </g>

      {/* 地标：远方断头的排线道路 */}
      <g className="city-map-far" stroke="var(--g-ink)" strokeWidth="2">
        <path d="M446 566l-14 40M446 566l14 40M446 566v44" opacity="0.7" />
        <path d="M402 610h88" strokeDasharray="6 6" opacity="0.5" />
      </g>

      {/* 桥梁（过河） */}
      <g className="city-map-bridge">
        <path d="M556 412c26 6 44 14 66 24" fill="none" stroke="var(--g-paper-light)" strokeWidth="26" />
        <path d="M556 412c26 6 44 14 66 24" fill="none" stroke="var(--g-ink)" strokeWidth="2.5" />
        <path d="M568 430v22M600 432v22" stroke="var(--g-ink)" strokeWidth="4" />
      </g>

      {/* 标注：街名 / 指北针 / 图号 / 折痕 */}
      <g className="city-map-labels" fill="var(--g-ink)" fontFamily="var(--g-font-mono)" fontSize="12" letterSpacing="1.5">
        <text x="70" y="176" transform="rotate(-4 70 176)">RIVERSIDE RD.</text>
        <text x="640" y="596" transform="rotate(3 640 596)">SUNSET BLVD.</text>
        <text x="768" y="60" transform="rotate(88 768 60)">NORTH / 00</text>
        <text x="352" y="520" transform="rotate(84 352 520)">OLD TOWN</text>
      </g>

      {/* 指北针 */}
      <g className="city-map-compass" transform="translate(72 96)">
        <circle r="26" fill="var(--g-paper-light)" stroke="var(--g-ink)" strokeWidth="2" />
        <path d="M0 -20l7 24-7-7-7 7z" fill="var(--g-ink)" />
        <text y="-28" textAnchor="middle" fill="var(--g-ink)" fontFamily="var(--g-font-mono)" fontSize="11" fontWeight="700">N</text>
      </g>

      {/* 图号 */}
      <g className="city-map-sheet" fill="var(--g-ink-soft)" fontFamily="var(--g-font-mono)" fontSize="11" letterSpacing="2">
        <text x="756" y="686">S-01 / 修订 01</text>
        <text x="60" y="686">ORIGINAL CITY PLAN</text>
      </g>

      {/* 折痕 */}
      <g className="city-map-folds" stroke="var(--g-ink)" strokeWidth="1" opacity="0.16">
        <path d="M300 -48V668M600 -48V668M-48 220h996M-48 460h996" />
      </g>
    </svg>
  )
}
