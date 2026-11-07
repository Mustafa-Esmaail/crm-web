'use client';

import {
  Button,
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
import type { FieldValues } from 'react-hook-form';

import { useDebounce } from '@/shared/hooks/use-debounce';

import type { FieldProps, SelectOption } from './field-types';
import { FormField } from './form-field';

const SEARCH_DEBOUNCE_MS = 250;

export interface AsyncOptionsResult {
  options: SelectOption[];
  isLoading: boolean;
}

interface AsyncSelectFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  /** Injected so this component never knows which endpoint (employees, departments…) it searches. */
  useOptions: (search: string) => AsyncOptionsResult;
  placeholder?: string;
  /** Label for the current value before any search has loaded it, e.g. when editing a record. */
  initialOption?: SelectOption | null;
  isClearable?: boolean;
}

export function AsyncSelectField<TValues extends FieldValues>({
  useOptions,
  placeholder,
  initialOption,
  isClearable = true,
  disabled,
  ...fieldProps
}: AsyncSelectFieldProps<TValues>) {
  const t = useTranslations('form');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<SelectOption | null>(initialOption ?? null);
  const { options, isLoading } = useOptions(useDebounce(search, SEARCH_DEBOUNCE_MS));

  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => {
        const value: string = field.value ?? '';
        const label =
          options.find((option) => option.value === value)?.label ??
          (picked?.value === value ? picked.label : undefined);

        return (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <div className="relative">
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  ref={field.ref}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={isInvalid}
                  aria-describedby={describedBy}
                  aria-expanded={isOpen}
                  onBlur={field.onBlur}
                  className="h-field bg-muted w-full justify-between font-normal"
                >
                  <span className={label ? 'truncate' : 'text-text-faint truncate'}>
                    {label ?? placeholder ?? t('select')}
                  </span>
                  <ChevronDown className="text-muted-foreground" aria-hidden />
                </Button>
              </PopoverTrigger>
              {isClearable && value && !disabled && (
                <button
                  type="button"
                  aria-label={t('clear')}
                  onClick={() => {
                    field.onChange('');
                    setPicked(null);
                  }}
                  className="text-muted-foreground hover:bg-surface-2 absolute end-9 top-1/2 -translate-y-1/2 rounded-sm p-1"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
            <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
              {/* shouldFilter off: the server already filtered by the search text. */}
              <Command shouldFilter={false}>
                <CommandInput placeholder={t('search')} value={search} onValueChange={setSearch} />
                <CommandList>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
                    </div>
                  ) : (
                    <CommandEmpty>{t('noResults')}</CommandEmpty>
                  )}
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          field.onChange(option.value);
                          setPicked(option);
                          setIsOpen(false);
                        }}
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {option.value === value && (
                          <Check className="text-primary size-4" aria-hidden />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    </FormField>
  );
}
