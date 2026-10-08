import { useWidgetStore } from '../core/store/widgetStore'
import { useUiStore } from '../core/store/uiStore'
import { widgetTypes } from '../widgets'

const WIDGET_SIDE: 'left' | 'right' = 'left'

export default function WidgetsLayer() {
  const { widgets, removeWidget } = useWidgetStore()
  const { openMenu, setGallery } = useUiStore()

  return (
    <div
      className={`absolute top-10 z-[1] w-[330px] grid grid-cols-2 gap-[14px] auto-rows-[158px] grid-flow-dense pointer-events-none
        ${WIDGET_SIDE === 'right' ? 'right-4' : 'left-4'}`}
    >
      {widgets.map((w) => {
        const def = widgetTypes[w.type]
        const Cmp = def.Component
        return (
          <div
            key={w.id}
            className={`pointer-events-auto ${def.size === 'medium' ? 'col-span-2' : ''}`}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openMenu(e.clientX, e.clientY, [
                { label: 'Remove Widget', onClick: () => removeWidget(w.id) },
                { label: 'Edit Widgets…', onClick: () => setGallery(true) },
              ])
            }}
          >
            <Cmp />
          </div>
        )
      })}
    </div>
  )
}