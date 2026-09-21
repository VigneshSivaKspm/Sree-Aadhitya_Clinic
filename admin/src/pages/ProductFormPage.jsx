import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { categoryService, productCrud } from '../services/crud';
import { deleteImageByUrl } from '../services/storageService';
import { setStock } from '../services/stockService';
import Button from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/DataDisplay';
import { SelectField, TextAreaField, TextField, Toggle } from '../components/ui/FormField';
import ImageUploader from '../components/ui/ImageUploader';
import { ErrorState, PageSkeleton } from '../components/ui/States';
import { getErrorMessage, logError } from '../utils/errors';
import { hasErrors, slugify, v } from '../utils/validators';

const blank = { name: '', slug: '', sku: '', categoryId: '', shortDescription: '', description: '', images: [], price: '', compareAtPrice: '', stockQuantity: '0', usageInformation: '', ingredients: '', featured: false, active: true };

function validate(f) {
  const errors = {
    name: v.text(f.name, { label: 'Name', min: 2, max: 150, required: true }),
    slug: v.slug(f.slug),
    sku: f.sku && !/^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/.test(f.sku.trim()) ? 'SKU can use letters, numbers, dots, hyphens and underscores (max 40).' : '',
    categoryId: v.select(f.categoryId, 'Category'),
    shortDescription: v.text(f.shortDescription, { label: 'Short description', max: 220 }),
    description: v.text(f.description, { label: 'Description', max: 5000 }),
    price: v.price(f.price, { label: 'Price' }),
    compareAtPrice: v.price(f.compareAtPrice, { label: 'Compare-at price', required: false }),
    stockQuantity: v.stock(f.stockQuantity, 'Stock quantity'),
    usageInformation: v.text(f.usageInformation, { label: 'Usage information', max: 2000 }),
    ingredients: v.text(f.ingredients, { label: 'Ingredients', max: 2000 }),
    images: f.images.length > 8 ? 'You can add up to 8 images.' : '',
  };
  if (!errors.compareAtPrice && f.compareAtPrice !== '' && Number(f.compareAtPrice) > 0 && Number(f.compareAtPrice) <= Number(f.price)) {
    errors.compareAtPrice = 'Compare-at price must be higher than the price (or leave it empty).';
  }
  return errors;
}

function ProductForm({ product }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const categories = useAsync(() => categoryService.list(), []);
  const originalImages = product?.images || [];
  const [values, setValues] = useState(product ? { ...blank, ...product, price: String(product.price ?? ''), compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '', stockQuantity: String(product.stockQuantity ?? 0), images: product.images || [] } : blank);
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = validate(values);
  const set = (k) => (val) => setValues((f) => ({ ...f, [k]: val }));
  const bind = (k) => ({ value: values[k] ?? '', onChange: (e) => set(k)(e.target.value), error: submitted ? errors[k] : '' });

  const discard = () => {
    values.images.filter((u) => !originalImages.includes(u)).forEach(deleteImageByUrl); // unsaved uploads
    navigate('/products');
  };

  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (hasErrors(errors)) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setBusy(true);
    try {
      const excludeId = product?.id;
      if (await productCrud.isTaken('slug', values.slug, { excludeId })) { toast.error('Another product already uses that slug.'); setBusy(false); return; }
      if (values.sku.trim() && (await productCrud.isTaken('sku', values.sku.trim(), { excludeId }))) { toast.error('Another product already uses that SKU.'); setBusy(false); return; }

      const stock = Number(values.stockQuantity);
      const data = {
        name: values.name.trim(), slug: values.slug, sku: values.sku.trim(), categoryId: values.categoryId,
        shortDescription: values.shortDescription.trim(), description: values.description.trim(),
        images: values.images, price: Number(values.price), compareAtPrice: values.compareAtPrice === '' ? 0 : Number(values.compareAtPrice),
        usageInformation: values.usageInformation.trim(), ingredients: values.ingredients.trim(),
        featured: values.featured, active: values.active,
      };

      if (product) {
        await productCrud.update(product.id, data, user);
        if (stock !== (Number(product.stockQuantity) || 0)) await setStock(product.id, stock, 'Edited in product form', user); // logs a stock movement
      } else {
        await productCrud.create({ ...data, stockQuantity: stock, inStock: stock > 0 }, user);
      }
      originalImages.filter((u) => !values.images.includes(u)).forEach(deleteImageByUrl); // removed images
      toast.success(product ? 'Product updated.' : 'Product added.');
      navigate('/products');
    } catch (err) {
      logError('product-save', err);
      toast.error(getErrorMessage(err, 'Could not save the product.'));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <PageHeader
        back={<Link to="/products" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" /> Products</Link>}
        title={product ? 'Edit product' : 'Add product'}
        actions={<><Button variant="secondary" onClick={discard} disabled={busy}>Cancel</Button><Button type="submit" loading={busy}>{product ? 'Save changes' : 'Add product'}</Button></>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Basic information">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Product name" required maxLength={150} className="sm:col-span-2" {...bind('name')} onChange={(e) => setValues((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))} />
              <TextField label="Slug (URL)" required {...bind('slug')} onChange={(e) => { setSlugTouched(true); set('slug')(slugify(e.target.value)); }} />
              <TextField label="SKU" hint="Optional, must be unique." maxLength={40} {...bind('sku')} />
              <TextAreaField label="Short description" className="sm:col-span-2" rows={2} maxLength={220} hint="Shown on product cards." {...bind('shortDescription')} />
              <TextAreaField label="Description" className="sm:col-span-2" rows={6} maxLength={5000} hint="Keep to factual product information. Avoid medical guarantees." {...bind('description')} />
            </div>
          </Card>
          <Card title="Details" description="Shown only when filled in.">
            <div className="grid gap-5">
              <TextAreaField label="Usage information" rows={3} maxLength={2000} {...bind('usageInformation')} />
              <TextAreaField label="Ingredients" rows={3} maxLength={2000} {...bind('ingredients')} />
            </div>
          </Card>
          <Card title="Images" description="The first image is the main product image.">
            <ImageUploader label="Product images" multiple max={8} folder="products" value={values.images} originalUrls={originalImages} onChange={set('images')} error={submitted ? errors.images : ''} onNotify={(m, t) => toast[t === 'error' ? 'error' : 'success'](m)} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Organisation">
            <div className="space-y-5">
              <SelectField label="Category" required disabled={categories.loading} value={values.categoryId} onChange={(e) => set('categoryId')(e.target.value)} error={submitted ? errors.categoryId : ''} hint={!categories.loading && !categories.data?.length ? 'Create a category first.' : undefined}>
                <option value="">Select a category</option>
                {(categories.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}{c.active ? '' : ' (inactive)'}</option>)}
              </SelectField>
              <Toggle label="Active" description="Visible in the shop." checked={values.active} onChange={set('active')} />
              <Toggle label="Featured" description="Shown on the home page." checked={values.featured} onChange={set('featured')} />
            </div>
          </Card>
          <Card title="Pricing & stock">
            <div className="space-y-5">
              <TextField label="Price (₹)" required type="number" inputMode="decimal" min="0" step="0.01" {...bind('price')} />
              <TextField label="Compare-at price (₹)" type="number" inputMode="decimal" min="0" step="0.01" hint="Optional original price, shown struck through." {...bind('compareAtPrice')} />
              <TextField label="Stock quantity" required type="number" inputMode="numeric" min="0" step="1" hint={product ? 'Changes are recorded in the stock history.' : undefined} {...bind('stockQuantity')} />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default function ProductFormPage() {
  const { id } = useParams();
  const q = useAsync(() => productCrud.get(id), [id], { enabled: !!id });
  if (!id) return <ProductForm />;
  if (q.loading) return <PageSkeleton />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;
  if (!q.data) return <ErrorState message="This product could not be found. It may have been deleted." />;
  return <ProductForm key={q.data.id} product={q.data} />;
}
