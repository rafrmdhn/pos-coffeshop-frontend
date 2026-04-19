import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, subDays, startOfMonth } from "date-fns"

interface DashboardDateRangeProps {
  from: Date
  to: Date
  onChange: (range: { from: Date; to: Date }) => void
}

export function DashboardDateRange({ from, to, onChange }: DashboardDateRangeProps) {
  const date = { from, to }

  const presets = [
    { label: "Hari ini", onClick: () => onChange({ from: new Date(), to: new Date() }) },
    { label: "7 Hari Terakhir", onClick: () => onChange({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Bulan Ini", onClick: () => onChange({ from: startOfMonth(new Date()), to: new Date() }) },
  ]

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex gap-1 bg-muted/30 p-1 rounded-full border border-border/40">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={preset.onClick}
            className="px-4 py-1.5 text-xs font-medium rounded-full hover:bg-background transition-colors text-muted-foreground hover:text-foreground hover:shadow-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full md:w-[240px] justify-start text-left font-sans font-medium rounded-full h-10 border-border/40 shadow-sm",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pilih Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={{ from: date.from, to: date.to }}
            onSelect={(range: any) => { 
              if(range?.from) {
                onChange({ from: range.from, to: range?.to || range.from })
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
