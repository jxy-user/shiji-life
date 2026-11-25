import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { art } from '../../data/assets'
import { useReducedMotion } from '../../motion/useReducedMotion'
import type { ArtKey } from '../../domain/types'

interface ArtImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  artKey: ArtKey
  sizes: string
}

function toCssSize(value: string | number | undefined) {
  if (value == null || value === '') return undefined
  if (typeof value === 'number') return `${value}px`
  return /^\d+$/.test(value) ? `${value}px` : value
}

export function ArtImage({ artKey, sizes, alt = '', width, height, className, onLoad, ...props }: ArtImageProps) {
  const source = art[artKey]
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const reduced = useReducedMotion()

  // 命中缓存的图不会稳定触发 onLoad，挂载时补一次完成判断
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [source.src])

  if (failed) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        style={{
          display: 'inline-block',
          width: toCssSize(width),
          height: toCssSize(height),
          border: '2px dashed var(--g-line-strong)',
          borderRadius: 'var(--g-radius-small)',
          backgroundColor: 'var(--g-paper)',
          backgroundImage: 'var(--g-halftone)',
          backgroundSize: 'var(--g-halftone-size)',
        }}
      />
    )
  }

  const classNames = ['g-art-image', loaded && !reduced ? 'g-art-loaded' : '', className].filter(Boolean).join(' ')

  return (
    <img
      {...props}
      ref={imgRef}
      className={classNames}
      src={source.src}
      srcSet={source.srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      onError={() => setFailed(true)}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
    />
  )
}
