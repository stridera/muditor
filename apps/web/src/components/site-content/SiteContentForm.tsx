'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { SiteContentKind } from '@/generated/graphql';
import {
  publicPathFor,
  useSiteContentMutations,
  type SiteContentItem,
} from '@/hooks/useSiteContent';
import { createErrorDisplay } from '@/lib/error-utils';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { MarkdownPreview } from './MarkdownPreview';

export const KIND_OPTIONS: { value: SiteContentKind; label: string }[] = [
  { value: 'LORE', label: 'Lore' },
  { value: 'NEWS', label: 'News' },
  { value: 'PAGE', label: 'Page' },
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface SiteContentFormProps {
  /** Existing row when editing; omit when creating. */
  item?: SiteContentItem;
}

export function SiteContentForm({ item }: SiteContentFormProps) {
  const router = useRouter();
  const { create, update, remove, saving, deleting } =
    useSiteContentMutations();

  const [title, setTitle] = useState(item?.title ?? '');
  const [slug, setSlug] = useState(item?.slug ?? '');
  // Editing an existing row: slug is considered manual so it never drifts.
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const [kind, setKind] = useState<SiteContentKind>(item?.kind ?? 'LORE');
  const [summary, setSummary] = useState(item?.summary ?? '');
  const [body, setBody] = useState(item?.body ?? '');
  const [published, setPublished] = useState(item?.published ?? false);
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const slugValid = SLUG_PATTERN.test(slug);
  const sortOrderNum = Number(sortOrder);
  const sortOrderValid =
    sortOrder.trim() !== '' && Number.isInteger(sortOrderNum);
  const canSave =
    title.trim() !== '' &&
    body.trim() !== '' &&
    slugValid &&
    sortOrderValid &&
    !saving &&
    !deleting;
  const publicPath = publicPathFor(kind, slug);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSave = async () => {
    if (!canSave) return;
    try {
      if (item) {
        await update({
          variables: {
            id: item.id,
            data: {
              title: title.trim(),
              slug,
              kind,
              summary: summary.trim() === '' ? null : summary,
              body,
              published,
              sortOrder: sortOrderNum,
            },
          },
        });
        toast.success('Content saved');
      } else {
        const result = await create({
          variables: {
            data: {
              title: title.trim(),
              slug,
              kind,
              summary: summary.trim() === '' ? null : summary,
              body,
              published,
              sortOrder: sortOrderNum,
            },
          },
        });
        toast.success('Content created');
        const newId = result.data?.createSiteContent.id;
        router.replace(
          newId ? `/dashboard/site-content/${newId}` : '/dashboard/site-content'
        );
      }
    } catch (err) {
      toast.error(createErrorDisplay(err).message);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      // Navigate first so the edit page does not flash "not found" when the
      // mutation's refetch removes this row.
      router.push('/dashboard/site-content');
      await remove({ variables: { id: item.id } });
      toast.success('Content deleted');
    } catch (err) {
      toast.error(createErrorDisplay(err).message);
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/dashboard/site-content'>
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back
            </Link>
          </Button>
          <h1 className='text-2xl font-bold text-foreground'>
            {item ? 'Edit Site Content' : 'New Site Content'}
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          {item && publicPath && (
            <Button variant='outline' asChild>
              <a href={publicPath} target='_blank' rel='noreferrer'>
                <ExternalLink className='h-4 w-4 mr-2' />
                View on site
              </a>
            </Button>
          )}
          {item && (
            <Button
              variant='destructive'
              onClick={() => setConfirmDelete(true)}
              disabled={saving || deleting}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Save className='h-4 w-4 mr-2' />
            )}
            Save
          </Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='sc-title'>Title</Label>
          <Input
            id='sc-title'
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='sc-slug'>Slug</Label>
          <Input
            id='sc-slug'
            value={slug}
            onChange={e => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            aria-invalid={!slugValid && slug !== ''}
          />
          {slug !== '' && !slugValid ? (
            <p className='text-xs text-destructive'>
              Lowercase letters, digits and single hyphens only (e.g.
              &quot;new-player-guide&quot;).
            </p>
          ) : (
            <p className='text-xs text-muted-foreground'>
              Unique across all content. Changing it breaks existing links.
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label>Kind</Label>
          <Select
            value={kind}
            onValueChange={v => setKind(v as SiteContentKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KIND_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='sc-sort'>Sort order</Label>
          <Input
            id='sc-sort'
            type='number'
            step={1}
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          />
        </div>
        <div className='space-y-2 md:col-span-2'>
          <Label htmlFor='sc-summary'>Summary</Label>
          <Input
            id='sc-summary'
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder='Short teaser shown in listings'
          />
        </div>
        <div className='flex items-center gap-2 md:col-span-2'>
          <Checkbox
            id='sc-published'
            checked={published}
            onCheckedChange={v => setPublished(v === true)}
          />
          <Label htmlFor='sc-published'>
            Published (visible on the public site)
          </Label>
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='sc-body'>Body (Markdown)</Label>
          <Textarea
            id='sc-body'
            value={body}
            onChange={e => setBody(e.target.value)}
            className='min-h-[28rem] font-mono text-sm'
          />
        </div>
        <div className='space-y-2'>
          <Label>Preview</Label>
          <div className='min-h-[28rem] max-h-[40rem] overflow-y-auto rounded-md border bg-card p-4'>
            <MarkdownPreview source={body} />
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{item?.title}&quot; will be permanently removed from the
              site. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
