import { useWindowStore } from '../core/store/windowStore'
import AppWindow from './AppWindow'

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows)
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {windows.map((w) => (
        <AppWindow key={w.id} win={w} />
      ))}
    </div>
  )
}