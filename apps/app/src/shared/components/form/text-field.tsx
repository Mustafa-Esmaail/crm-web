'use client';

import { cn, Input } from '@crm/ui';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';

import type { FieldProps } from './field-types';
import { FormField } from './form-field';

interface TextFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  type?: 'text' | 'email' | 'tel' | 'password' | 'search';
  placeholder?: string;
  autoComplete?: string;
  /** Email, phone and codes read left-to-right even inside an Arabic form. */
  isLtr?: boolean;
  /** Decorative icon on the start side of the input. */
  icon?: LucideIcon;
}

export function TextField<TValues extends FieldValues>({
  type = 'text',
  placeholder,
  autoComplete,
  isLtr,
  icon: Icon,
  disabled,
  ...fieldProps
}: TextFieldProps<TValues>) {
  const t = useTranslations('form');
  const [isRevealed, setIsRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <FormField {...fieldProps} disabled={disabled}>
      {({ field, id, isInvalid, describedBy }) => (
        <div className="relative">
          {Icon && (
            <Icon
              className="text-text-faint pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden
            />
          )}
          <Input
            {...field}
            id={id}
            type={isPassword && isRevealed ? 'text' : type}
            value={field.value ?? ''}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
            dir={isLtr ? 'ltr' : undefined}
            className={cn(isLtr && 'num ltr-field', (Icon || isPassword) && 'px-10')}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setIsRevealed((value) => !value)}
              aria-label={isRevealed ? t('hidePassword') : t('showPassword')}
              aria-pressed={isRevealed}
              className="text-text-faint hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2"
            >
              {isRevealed ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          )}
        </div>
      )}
    </FormField>
  );
}
