'use client';

import { isApiError } from '@crm/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@crm/ui';
import { ExternalLink, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState } from 'react';

import { PERMISSIONS } from '@/config/permissions';
import { ErrorState } from '@/shared/components/feedback/error-state';
import { FormAlert } from '@/shared/components/form/form-alert';
import { useCan } from '@/shared/hooks/use-can';

import { unitMediaUrl } from '../api/unit-extras-requests';
import { UNIT_MEDIA_LIMIT } from '../constants';
import { useDeleteUnitMedia, useUnitMedia, useUploadUnitMedia } from '../hooks/use-unit-extras';
import { MEDIA_KINDS, type MediaKind, type Unit, type UnitMedia } from '../types';
import { acceptFor, checkFile, formatFileSize, isImage } from '../utils/media';

/** Photos, floor plans and the brochure of one unit. Files load through the app's proxy. */
export function UnitMediaDialog({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  const t = useTranslations('units.media');
  const canManage = useCan(PERMISSIONS.unitMediaManage);
  const query = useUnitMedia(unit.id);
  const remove = useDeleteUnitMedia(unit.id);
  const media = query.data ?? [];
  const images = media.filter(isImage);
  const documents = media.filter((item) => !isImage(item));

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title', { unit: unit.unit_number })}</DialogTitle>
          <DialogDescription>
            {t('description', { count: media.length, max: UNIT_MEDIA_LIMIT })}
          </DialogDescription>
        </DialogHeader>

        {canManage && <UploadControl unitId={unit.id} isFull={media.length >= UNIT_MEDIA_LIMIT} />}

        {query.error ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="aspect-video w-full" />
          </div>
        ) : media.length === 0 ? (
          <p className="text-small text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-4">
            {images.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((item) => (
                  <li key={item.id} className="group relative overflow-hidden rounded-md border">
                    <a href={unitMediaUrl(unit.id, item.id)} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element -- authenticated proxy URL, not a static asset */}
                      <img
                        src={unitMediaUrl(unit.id, item.id)}
                        alt={item.original_name}
                        loading="lazy"
                        className="bg-muted aspect-video w-full object-cover"
                      />
                    </a>
                    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                      <span className="text-caption text-muted-foreground truncate">
                        {t(`kinds.${item.kind}`)}
                      </span>
                      {canManage && (
                        <DeleteButton
                          item={item}
                          label={t('delete')}
                          isPending={remove.isPending}
                          onDelete={() => remove.mutate(item.id)}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {documents.length > 0 && (
              <ul className="divide-y rounded-md border">
                {documents.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                    <FileText className="text-muted-foreground size-5 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <a
                        href={unitMediaUrl(unit.id, item.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary inline-flex max-w-full items-center gap-1 hover:underline"
                      >
                        <span className="truncate">{item.original_name}</span>
                        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                      </a>
                      <p className="text-caption text-text-faint">
                        {t(`kinds.${item.kind}`)} ·{' '}
                        <span className="num">{formatFileSize(item.size)}</span>
                      </p>
                    </div>
                    {canManage && (
                      <DeleteButton
                        item={item}
                        label={t('delete')}
                        isPending={remove.isPending}
                        onDelete={() => remove.mutate(item.id)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton({
  item,
  label,
  isPending,
  onDelete,
}: {
  item: UnitMedia;
  label: string;
  isPending: boolean;
  onDelete: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      aria-label={`${label}: ${item.original_name}`}
      onClick={onDelete}
    >
      <Trash2 aria-hidden />
    </Button>
  );
}

/** Pick a kind, then a file; it uploads at once. Wrong types and sizes are refused before sending. */
function UploadControl({ unitId, isFull }: { unitId: number; isFull: boolean }) {
  const t = useTranslations('units.media');
  const kindId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<MediaKind>('photo');
  const [problem, setProblem] = useState<string | null>(null);
  const upload = useUploadUnitMedia(unitId);

  const onFile = (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    const issue = checkFile(kind, file);
    if (issue) {
      setProblem(t(issue === 'type' ? `wrongType.${kind}` : 'tooLarge'));
      return;
    }
    setProblem(null);
    upload.mutate(
      { kind, file },
      {
        onError: (error) =>
          setProblem(
            isApiError(error)
              ? (Object.values(error.fieldErrors)[0]?.[0] ?? error.message)
              : t('uploadFailed'),
          ),
      },
    );
  };

  return (
    <div className="bg-muted/40 space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor={kindId}>{t('kind')}</Label>
          <Select value={kind} onValueChange={(value) => setKind(value as MediaKind)}>
            <SelectTrigger id={kindId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDIA_KINDS.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`kinds.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptFor(kind)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          disabled={upload.isPending || isFull}
          onClick={() => inputRef.current?.click()}
        >
          {upload.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Upload aria-hidden />
          )}
          {t('upload')}
        </Button>
      </div>
      <p className="text-caption text-muted-foreground">{isFull ? t('full') : t(`hint.${kind}`)}</p>
      <FormAlert messages={problem ? [problem] : []} />
    </div>
  );
}
