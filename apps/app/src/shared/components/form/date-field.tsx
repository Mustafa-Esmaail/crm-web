'use client';

import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@crm/ui';
import { format, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps } from './field-types';
import { FormField } from './form-field';

const API_DATE_FORMAT = 'yyyy-MM-dd';

interface DateFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  placeholder?: string;
}

/** The form value is the API's plain `YYYY-MM-DD` string, never a Date, so it serialises as-is. */
export function DateField<TValues extends FieldValues>({
  placeholder,
  disabled,
  ...fieldProps
}: DateFieldProps<TValues>) {
  const t = useTranslations('form');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => {
        const value: string = field.value ?? '';
        const selected = value ? parseISO(value) : undefined;

        return (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                id={id}
                ref={field.ref}
                type="button"
                variant="outline"
                disabled={disabled}
                aria-invalid={isInvalid}
                aria-describedby={describedBy}
                onBlur={field.onBlur}
                className="h-field bg-muted w-full justify-start font-normal"
              >
                <CalendarDays className="text-muted-foreground" aria-hidden />
                <span className={selected ? 'num' : 'text-text-faint'}>
                  {selected
                    ? format(selected, 'PPP', { locale: dateLocale })
                    : (placeholder ?? t('pickDate'))}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                locale={dateLocale}
                selected={selected}
                onSelect={(date) => {
                  field.onChange(date ? format(date, API_DATE_FORMAT) : '');
                  setIsOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        );
      }}
    </FormField>
  );
}
