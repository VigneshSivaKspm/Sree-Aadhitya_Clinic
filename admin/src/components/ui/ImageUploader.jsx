import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { deleteImageByUrl, MAX_IMAGE_MB, uploadImage } from '../../services/storageService';
import { getErrorMessage, logError } from '../../utils/errors';

/**
 * Uploads to Firebase Storage immediately and reports the resulting URL list via onChange.
 *  - value: string[] of image URLs (single mode uses at most one)
 *  - originalUrls: URLs already saved on the record. Removing one of these is only
 *    *deferred* (the parent deletes it after a successful save); removing an image that
 *    was uploaded during this editing session deletes it from Storage right away.
 */
export default function ImageUploader({ label, value = [], onChange, folder, multiple = false, max = 6, originalUrls = [], error, hint, onNotify }) {
  const inputRef = useRef(null);
  const [uploads, setUploads] = useState([]); // [{ key, name, progress }]
  const busy = uploads.length > 0;
  const remaining = multiple ? max - value.length : 1;

  const handleFiles = async (fileList) => {
    let files = [...fileList];
    if (!files.length) return;
    if (multiple && files.length > remaining) {
      onNotify?.(`You can add up to ${max} images. Extra files were skipped.`, 'error');
      files = files.slice(0, Math.max(remaining, 0));
    }
    const added = [];
    await Promise.all(
      files.map(async (file) => {
        const key = `${file.name}-${Math.random()}`;
        setUploads((u) => [...u, { key, name: file.name, progress: 0 }]);
        try {
          const { url } = await uploadImage(file, folder, (p) => setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress: p } : x))));
          added.push(url);
        } catch (err) {
          logError('upload', err);
          onNotify?.(getErrorMessage(err, `Could not upload “${file.name}”.`), 'error');
        } finally {
          setUploads((u) => u.filter((x) => x.key !== key));
        }
      }),
    );
    if (added.length) {
      const replaced = multiple ? [] : value; // single mode: the previous image is replaced
      onChange(multiple ? [...value, ...added] : [added[0]]);
      replaced.filter((u) => !originalUrls.includes(u)).forEach(deleteImageByUrl);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (url) => {
    onChange(value.filter((u) => u !== url));
    if (!originalUrls.includes(url)) deleteImageByUrl(url);
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-800">{label}</p>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="group relative size-24 overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
            <img src={url} alt="" className="size-full object-cover" />
            <button type="button" onClick={() => remove(url)} aria-label="Remove image" className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-md bg-white/90 text-danger-600 shadow hover:bg-white">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {uploads.map((u) => (
          <div key={u.key} className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink-300 bg-ink-50 text-xs text-ink-600" role="status" aria-label={`Uploading ${u.name}`}>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            {u.progress}%
          </div>
        ))}
        {(multiple ? remaining > 0 : true) && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-300 text-xs font-medium text-ink-600 hover:border-dental-600 hover:bg-dental-50 hover:text-dental-700 disabled:opacity-50">
            <ImagePlus className="size-5" aria-hidden="true" />
            {multiple ? 'Add' : value.length ? 'Replace' : 'Upload'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple={multiple} className="sr-only" tabIndex={-1} aria-label={`${label} file input`} onChange={(e) => handleFiles(e.target.files)} />
      {error ? <p role="alert" className="mt-1.5 text-xs text-danger-600">{error}</p> : <p className="mt-1.5 text-xs text-ink-500">{hint || `JPG, PNG, WebP or AVIF, up to ${MAX_IMAGE_MB} MB each.`}</p>}
    </div>
  );
}
