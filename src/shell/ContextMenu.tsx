import { useUiStore } from '../core/store/uiStore'
import MenuPanel from '../components/MenuPanel'

export default function ContextMenu() {
  const { contextMenu, closeMenu } = useUiStore()
  if (!contextMenu) return null
  const { x, y, items } = contextMenu

  return (
    <div
      className="fixed inset-0 z-[2000]"
      onMouseDown={closeMenu}
      onContextMenu={(e) => {
        e.preventDefault()
        closeMenu()
      }}
    >
      {/* stop the press from reaching the backdrop, otherwise the menu closes before the click */}
      <div
        className="absolute"
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
        style={{
          left: Math.min(x, window.innerWidth - 230),
          top: Math.min(y, window.innerHeight - items.length * 28 - 20),
        }}
      >
        <MenuPanel items={items} onDone={closeMenu} />
      </div>
    </div>
  )
}