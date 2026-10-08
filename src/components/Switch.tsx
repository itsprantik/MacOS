export default function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative w-[38px] h-[22px] rounded-full transition-colors ${on ? 'bg-[#34c759]' : 'bg-neutral-300'}`}
    >
      <span
        className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-[2px]'}`}
      />
    </button>
  )
}