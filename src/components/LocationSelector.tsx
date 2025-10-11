import { useEffect, useRef, useState } from 'react';
import { Star, MapPin, Check } from 'lucide-react';
import { useLocationsStore } from '@/lib/store/locationsStore';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { AddressSearch } from './AddressSearch';
import { env } from '@/config/env';

interface LocationSelectorProps {
  onSelect: (name: string, address: string, lat?: number, lng?: number) => void;
}

export function LocationSelector({ onSelect }: LocationSelectorProps) {
   const inputRef = useRef<HTMLInputElement | null>(null);
  const { getSortedLocations, toggleStar, updateLastUsed } = useLocationsStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const sortedLocations = getSortedLocations();
  const filteredLocations = search
    ? sortedLocations.filter(
        loc =>
          loc.name.toLowerCase().includes(search.toLowerCase()) ||
          loc.address.toLowerCase().includes(search.toLowerCase())
      )
    : sortedLocations;

  const handleSelect = (loc: typeof sortedLocations[0]) => {
    onSelect(loc.name, loc.address, loc.lat, loc.lng);
    updateLastUsed(loc.id);
    setOpen(false);
    setSearch('');
  };
useEffect(() => {
  if (!inputRef.current) return;
  console.log(AddressSearch(
    env.googleMapsApiKey,
    inputRef.current,
    (place) => {
      console.log("Selected Place:", place);
    },
  ))
}, [search]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Select Saved Location
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b border-border">
          <Input
            ref={inputRef}
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filteredLocations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {search ? 'No locations found' : 'No saved locations yet'}
            </div>
          ) : (
            filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-start gap-2 p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(loc.id);
                  }}
                  className="mt-1"
                >
                  <Star
                    className={`w-4 h-4 ${
                      loc.is_starred
                        ? 'text-warning fill-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => handleSelect(loc)}
                >
                  <p className="font-medium text-sm truncate">{loc.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {loc.address}
                  </p>
                </div>
                <button
                  onClick={() => handleSelect(loc)}
                  className="text-primary hover:text-primary/80"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
