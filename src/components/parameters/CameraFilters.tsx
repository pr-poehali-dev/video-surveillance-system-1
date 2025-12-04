import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Owner, TerritorialDivision, OWNERS_API, DIVISIONS_API } from './camera-list/CameraListTypes';

interface CameraFiltersProps {
  selectedOwners: string[];
  selectedDivisions: string[];
  onOwnersChange: (owners: string[]) => void;
  onDivisionsChange: (divisions: string[]) => void;
}

export const CameraFilters = ({
  selectedOwners,
  selectedDivisions,
  onOwnersChange,
  onDivisionsChange,
}: CameraFiltersProps) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [divisions, setDivisions] = useState<TerritorialDivision[]>([]);

  useEffect(() => {
    fetchOwners();
    fetchDivisions();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch(OWNERS_API);
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch(DIVISIONS_API);
      if (response.ok) {
        const data = await response.json();
        setDivisions(data);
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const handleOwnerToggle = (owner: string) => {
    const newOwners = selectedOwners.includes(owner)
      ? selectedOwners.filter(o => o !== owner)
      : [...selectedOwners, owner];
    onOwnersChange(newOwners);
  };

  const handleDivisionToggle = (division: string) => {
    const newDivisions = selectedDivisions.includes(division)
      ? selectedDivisions.filter(d => d !== division)
      : [...selectedDivisions, division];
    onDivisionsChange(newDivisions);
  };

  const handleClearFilters = () => {
    onOwnersChange([]);
    onDivisionsChange([]);
  };

  const activeFiltersCount = selectedOwners.length + selectedDivisions.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Icon name="Filter" size={18} className="mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Фильтры</h4>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="h-auto p-1 text-xs"
              >
                Сбросить
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium mb-2">Собственники</h5>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {owners.map((owner) => (
                    <div key={owner.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`owner-${owner.name}`}
                        checked={selectedOwners.includes(owner.name)}
                        onCheckedChange={() => handleOwnerToggle(owner.name)}
                      />
                      <label
                        htmlFor={`owner-${owner.name}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {owner.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Территориальные деления</h5>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {divisions.map((division) => (
                    <div key={division.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`division-${division.name}`}
                        checked={selectedDivisions.includes(division.name)}
                        onCheckedChange={() => handleDivisionToggle(division.name)}
                      />
                      <label
                        htmlFor={`division-${division.name}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {division.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
