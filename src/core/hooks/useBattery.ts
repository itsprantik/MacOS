import { useEffect, useState } from 'react'

export function useBattery() {
  const [state, setState] = useState({ level: 0.96, charging: false })

  useEffect(() => {
    let battery: any
    const update = () => setState({ level: battery.level, charging: battery.charging })

    ;(navigator as any).getBattery?.().then((b: any) => {
      battery = b
      update()
      b.addEventListener('levelchange', update)
      b.addEventListener('chargingchange', update)
    })

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', update)
        battery.removeEventListener('chargingchange', update)
      }
    }
  }, [])

  return state
}