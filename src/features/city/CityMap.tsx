import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { scenes } from '../../data/scenes'
import { useReducedMotion } from '../../motion/useReducedMotion'
import styles from './CityMap.module.css'

const positions: Record<string, { x: number; y: number }> = {
  home: { x: 23, y: 19 },
  school: { x: 70, y: 18 },
  plaza: { x: 52, y: 43 },
  blocks: { x: 82, y: 43 },
  park: { x: 20, y: 53 },
  studio: { x: 40, y: 70 },
  harbor: { x: 73, y: 70 },
  far: { x: 50, y: 88 },
}

export default function CityMap() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const zoomTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (zoomTimer.current !== null) window.clearTimeout(zoomTimer.current)
  }, [])

  // 普通左键：先以热点为锚点推近地图，再进入场景；修饰键 / reduced 直接走原生链接
  function handleHotspotClick(event: MouseEvent<HTMLAnchorElement>, sceneId: string, to: string) {
    if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    if (zoomTimer.current !== null) return
    const position = positions[sceneId]!
    setZoom(position)
    zoomTimer.current = window.setTimeout(() => {
      zoomTimer.current = null
      navigate(to)
      setZoom(null)
    }, 320)
  }

  return (
    <section className={styles.mapFrame} aria-labelledby="city-map-title">
      <header className={styles.mapHeader}>
        <div><span>ORIGINAL CITY PLAN / 01</span><h2 id="city-map-title">未完成之城</h2></div>
        <div className={styles.mapWeather}><span>晴</span><strong>18:40</strong><small>能见度良好</small></div>
      </header>

      <div
        className={[styles.canvas, zoom ? styles.canvasZooming : ''].filter(Boolean).join(' ')}
        style={zoom ? ({ ['--zoom-x' as string]: `${zoom.x}%`, ['--zoom-y' as string]: `${zoom.y}%` }) : undefined}
      >
        <svg className={styles.mapArt} viewBox="0 0 900 620" preserveAspectRatio="none" aria-hidden="true">
          <rect width="900" height="620" fill="#e8ddc6" />
          <path d="M620 -20C560 94 690 154 638 264S508 448 610 650" fill="none" stroke="#a9c9d8" strokeWidth="116" />
          <path d="M620 -20C560 94 690 154 638 264S508 448 610 650" fill="none" stroke="#141414" strokeWidth="3" strokeDasharray="12 9" />
          <path d="M-20 455C170 404 263 458 403 420S604 353 940 402" fill="none" stroke="#f4ebd8" strokeWidth="40" />
          <path d="M-20 455C170 404 263 458 403 420S604 353 940 402M318 -20C350 100 302 206 364 318S506 470 470 650M92 -20C136 110 98 220 166 314S284 476 272 650" fill="none" stroke="#141414" strokeWidth="4" strokeDasharray="16 11" />
          <g fill="#7c8b5a" stroke="#141414" strokeWidth="3">
            <path d="M62 244h150v150H62z" />
            <path d="M715 70h128v112H715z" />
            <path d="M690 478h136v90H690z" />
          </g>
          <g fill="#f4ebd8" stroke="#141414" strokeWidth="3">
            <path d="M254 50h118v96H254zM424 52h104v91H424zM266 160h103v104H266zM428 184h105v104H428zM88 24h110v104H88zM90 86h103v96H90z" />
            <path d="M604 32h90v92h-90zM746 225h106v83H746zM672 300h104v83H672zM560 502h98v86h-98z" />
            <path d="M362 364h122v92H362zM300 510h96v82h-96z" />
          </g>
          <circle cx="468" cy="266" r="74" fill="#f2b705" stroke="#141414" strokeWidth="4" />
          <circle cx="468" cy="266" r="31" fill="#f4ebd8" stroke="#141414" strokeWidth="3" />
          <path d="M468 192v148M394 266h148" stroke="#141414" strokeWidth="4" />
          <g fill="#141414" fontFamily="monospace" fontSize="13" letterSpacing="2">
            <text x="35" y="598">NORTH / 00</text>
            <text x="755" y="598">SUNSET SIDE</text>
          </g>
          <path d="M48 554l18-34 18 34z" fill="#141414" />
          <text x="58" y="548" fill="#f4ebd8" fontFamily="monospace" fontSize="12">N</text>
        </svg>

        {scenes.map((scene, index) => {
          const position = positions[scene.id]!
          return (
            <Link
              key={scene.id}
              to={`/scene/${scene.id}`}
              data-scene={scene.id}
              className={[styles.hotspot, scene.id === 'plaza' ? styles.hotspotPlaza : ''].filter(Boolean).join(' ')}
              style={{ left: `${position.x}%`, top: `${position.y}%`, ['--hotspot-index' as string]: index }}
              aria-label={`前往${scene.title}`}
              onClick={(event) => handleHotspotClick(event, scene.id, `/scene/${scene.id}`)}
            >
              <span className={styles.hotspotPin}><MapPin size={18} strokeWidth={2.5} aria-hidden="true" /></span>
              <span className={styles.hotspotLabel}><small>{scene.code}</small><strong>{scene.title}</strong></span>
            </Link>
          )
        })}
      </div>

      <footer className={styles.mapFooter}>
        <span><i className={styles.legendCurrent} aria-hidden="true" />当前位置</span>
        <span><i className={styles.legendPlace} aria-hidden="true" />可探索地点</span>
        <span className={styles.scale}>0 ━━━ 500 m</span>
      </footer>
    </section>
  )
}
