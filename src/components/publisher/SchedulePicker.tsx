'use client'

interface SchedulePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onChange(null)
    } else {
      onChange(new Date(e.target.value))
    }
  }

  const dateValue = value 
    ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) 
    : ''

  return (
    <div className="flex flex-col gap-2">
      <input
        type="datetime-local"
        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 font-medium text-[#111827]"
        value={dateValue}
        onChange={handleChange}
      />
    </div>
  )
}
