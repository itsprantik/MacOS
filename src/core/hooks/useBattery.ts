import { useEffect, useState } from 'react'

export interface BatteryInfo {
  supported: boolean
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

const EVENTS = ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange']

export function useBattery(): BatteryInfo {
  const [info, setInfo] = useState<BatteryInfo>({
    supported: false, level: 1, charging: false, chargingTime: Infinity, dischargingTime: Infinity,
  })

  useEffect(() => {
    const nav = navigator as any
    if (typeof nav.getBattery !== 'function') return

    let battery: any
    let cancelled = false
    const update = () =>
      setInfo({
        supported: true,
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      })

    nav.getBattery().then((b: any) => {
      if (cancelled) return
      battery = b
      update()
      EVENTS.forEach((ev) => b.addEventListener(ev, update))
    })

    return () => {
      cancelled = true
      if (battery) EVENTS.forEach((ev) => battery.removeEventListener(ev, update))
    }
  }, [])

  return info
}