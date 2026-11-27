import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, MapPin } from 'lucide-react'
import { scenes } from '../../data/scenes'
import { useReducedMotion } from '../../motion/useReducedMotion'
import CityMapArt from './CityMapArt'
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

interface CityMapProps {
  exploredSceneIds?: readonly string[]
}

export default function CityMap({ exploredSceneIds = [] }: CityMapProps) {
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

  const exploredTitles = exploredSceneIds
    .map((id) => scenes.find((scene) => scene.id === id)?.title)
    .filter(Boolean)
    .join('、')

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
        <CityMapArt />

        {scenes.map((scene, index) => {
          const position = positions[scene.id]!
          const explored = exploredSceneIds.includes(scene.id)
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
              {explored && <span className={styles.exploredStamp} aria-hidden="true"><Check size={12} strokeWidth={3} />到过</span>}
            </Link>
          )
        })}

        <p className={styles.visuallyHidden}>已到过：{exploredTitles || '暂无'}</p>
      </div>

      <footer className={styles.mapFooter}>
        <span><i className={styles.legendCurrent} aria-hidden="true" />当前所在</span>
        <span><i className={styles.legendExplored} aria-hidden="true" />到过</span>
        <span><i className={styles.legendUnvisited} aria-hidden="true" />可探索</span>
        <span className={styles.scale} aria-hidden="true">
          <i /><i /><i /><i />
          <small>0 / 250 / 500 m</small>
        </span>
      </footer>
    </section>
  )
}
