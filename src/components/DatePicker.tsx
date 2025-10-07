import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { useDateStore } from '@/lib/store/dateStore';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function DatePicker() {
  const { selectedDate, setSelectedDate, goToToday, goToPrevDay, goToNextDay } = useDateStore();
  
  const currentDate = parse(selectedDate, 'yyyy-MM-dd', new Date());
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPrevDay}
        className="px-2"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            {format(currentDate, 'MMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(format(date, 'yyyy-MM-dd'));
              }
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextDay}
        className="px-2"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={goToToday}
      >
        Today
      </Button>
    </div>
  );
}
