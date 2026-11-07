'use client';

import { Label } from '@crm/ui';
import { useTranslations } from 'next-intl';
import { type ReactNode, useId } from 'react';
import {
  Controller,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import type { FieldProps } from './field-types';

export const SERVER_ERROR_TYPE = 'server';

interface RenderArgs<TValues extends FieldValues> {
  field: ControllerRenderProps<TValues, Path<TValues>>;
  id: string;
  isInvalid: boolean;
  describedBy: string | undefined;
}

interface FormFieldProps<TValues extends FieldValues> extends FieldProps<TValues> {
  children: (args: RenderArgs<TValues>) => ReactNode;
}

/** Label, description and error plumbing shared by every field; children render only the control. */
export function FormField<TValues extends FieldValues>({
  name,
  label,
  control,
  description,
  isRequired,
  children,
}: FormFieldProps<TValues>) {
  const t = useTranslations();
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error;
        // Server messages arrive already translated by Laravel; client messages are i18n keys.
        const message = error?.message
          ? error.type === SERVER_ERROR_TYPE
            ? error.message
            : t(error.message)
          : undefined;
        const describedBy =
          [description ? descriptionId : null, message ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined;

        return (
          <div className="space-y-1.5">
            <Label htmlFor={id}>
              {label}
              {isRequired && (
                <span className="text-destructive" aria-hidden>
                  {' *'}
                </span>
              )}
            </Label>
            {children({ field, id, isInvalid: Boolean(error), describedBy })}
            {description && (
              <p id={descriptionId} className="text-caption text-muted-foreground">
                {description}
              </p>
            )}
            {message && (
              <p id={errorId} role="alert" className="text-caption text-destructive">
                {message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
