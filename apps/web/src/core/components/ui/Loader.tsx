import { cn } from '@/shared/lib/cn'

type LoaderProps = {
  label?: string
  fullScreen?: boolean
}

export function Loader({ label = 'جارٍ التحميل...', fullScreen = false }: LoaderProps) {
  return (
    <div className={cn('loader-wrap', fullScreen && 'loader-wrap--fullscreen')}>
      <span className="loader-spinner" />
      <p>{label}</p>
    </div>
  )
}