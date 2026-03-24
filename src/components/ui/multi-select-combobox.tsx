import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export const MultiSelectCombobox = ({
  options,
  selected,
  onChange,
  placeholder = 'Выберите...',
  searchPlaceholder = 'Поиск...',
  className,
}: MultiSelectComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedLabels = selected.map(
    (v) => options.find((o) => o.value === v)?.label ?? v
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring',
          open && 'ring-1 ring-ring'
        )}
      >
        <span className="flex-1 text-left truncate">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : selected.length === 1 ? (
            selectedLabels[0]
          ) : (
            <span className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {selected.length}
              </Badge>
              <span className="text-muted-foreground text-xs truncate">
                {selectedLabels.join(', ')}
              </span>
            </span>
          )}
        </span>
        <Icon name="ChevronsUpDown" size={14} className="ml-2 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <Input
              autoFocus
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">Ничего не найдено</p>
            ) : (
              filtered.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
                      isSelected && 'bg-accent/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-primary',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-transparent'
                      )}
                    >
                      {isSelected && <Icon name="Check" size={10} />}
                    </div>
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => { onChange([]); setSearch(''); }}
              >
                <Icon name="X" size={12} className="mr-1" />
                Сбросить выбор
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectCombobox;
