'use client';

import {
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@crm/ui';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useDebounce } from '@/shared/hooks/use-debounce';

import type { FilterDefinition, FilterOption } from './types';

const SEARCH_DEBOUNCE_MS = 250;
const useNoLabel = () => undefined;

interface OptionsListProps {
  options: FilterOption[];
  isLoading: boolean;
  value: string | null | undefined;
  onSelect: (value: string | null) => void;
  /** Server-searched lists must not be filtered a second time by the client. */
  search?: { value: string; onChange: (value: string) => void };
}

function OptionsList({ options, isLoading, value, onSelect, search }: OptionsListProps) {
  const t = useTranslations('dataTable');

  return (
    <Command shouldFilter={!search}>
      <CommandInput
        placeholder={t('searchOptions')}
        value={search?.value}
        onValueChange={search?.onChange}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
          </div>
        ) : (
          <CommandEmpty>{t('noOptions')}</CommandEmpty>
        )}
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={search ? option.value : option.label}
              onSelect={() => onSelect(option.value === value ? null : option.value)}
            >
              <span className="flex-1 truncate">{option.label}</span>
              {option.value === value && <Check className="text-primary size-4" aria-hidden />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/** Options come from the definition's own hook, so the search box talks to the API. */
function AsyncOptionsList({
  useOptions,
  ...props
}: Omit<OptionsListProps, 'options' | 'isLoading' | 'search'> & {
  useOptions: NonNullable<FilterDefinition['useOptions']>;
}) {
  const [search, setSearch] = useState('');
  const { options, isLoading } = useOptions(useDebounce(search, SEARCH_DEBOUNCE_MS));

  return (
    <OptionsList
      {...props}
      options={options}
      isLoading={isLoading}
      search={{ value: search, onChange: setSearch }}
    />
  );
}

interface FilterChipProps {
  definition: FilterDefinition;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

export function FilterChip({ definition, value, onChange }: FilterChipProps) {
  const t = useTranslations('dataTable');
  const [isOpen, setIsOpen] = useState(false);
  const useSelectedLabel = definition.useSelectedLabel ?? useNoLabel;
  const resolvedLabel = useSelectedLabel(value);
  const isActive = value != null && value !== '';
  const Icon = definition.icon;
  const selectedLabel =
    definition.options.find((option) => option.value === value)?.label ?? resolvedLabel ?? value;

  const select = (next: string | null) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <span
      className={cn(
        'text-small h-chip inline-flex items-center rounded-md border',
        isActive
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border-strong bg-card text-secondary-foreground',
      )}
    >
      {isActive && (
        <button
          type="button"
          aria-label={t('clearFilter', { filter: definition.label })}
          onClick={() => onChange(null)}
          className="hover:bg-primary-soft-2 ms-1.5 rounded-sm p-0.5"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className="flex h-full items-center gap-1.5 px-2.5 font-medium">
          {Icon && <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />}
          <span>{definition.label}</span>
          {isActive && <span className="font-semibold">: {selectedLabel}</span>}
          {definition.isLoading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            !isActive && !Icon && <ChevronDown className="size-3.5" aria-hidden />
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60 p-0">
          {definition.useOptions ? (
            <AsyncOptionsList useOptions={definition.useOptions} value={value} onSelect={select} />
          ) : (
            <OptionsList
              options={definition.options}
              isLoading={false}
              value={value}
              onSelect={select}
            />
          )}
        </PopoverContent>
      </Popover>
    </span>
  );
}
