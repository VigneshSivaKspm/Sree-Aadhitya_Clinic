import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { Disclaimer } from '../components/practice/PracticeSections';
import ProductCard, { PriceTag, isInStock } from '../components/shop/ProductCard';
import Button from '../components/ui/Button';
import QuantitySelector from '../components/ui/QuantitySelector';
import Seo from '../components/ui/Seo';
import SmartImage from '../components/ui/SmartImage';
import { ErrorState, PageSkeleton } from '../components/ui/States';
import { useCart } from '../contexts/CartContext';
import { useSite } from '../contexts/SiteContext';
import { useToast } from '../contexts/ToastContext';
import { useCategories, useProduct, useProducts } from '../hooks/useCatalog';
import NotFoundPage from './NotFoundPage';

export default function ProductPage() {
  const { slug } = useParams();
  const q = useProduct(slug);
  const categories = useCategories();
  const all = useProducts();
  const { addProduct, openCart, items } = useCart();
  const { settings } = useSite();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  if (q.loading) return <PageSkeleton />;
  if (q.error) return <div className="container-page py-16"><ErrorState message={q.error} onRetry={q.reload} /></div>;
  if (!q.data) return <NotFoundPage title="Product not found" message="This product may no longer be available." backTo="/shop" backLabel="Back to shop" />;

  const p = q.data;
  const category = (categories.data || []).find((c) => c.id === p.categoryId);
  const inStock = isInStock(p);
  const stock = Number(p.stockQuantity) || 0;
  const inCart = items.find((i) => i.productId === p.id)?.quantity || 0;
  const maxAddable = Math.max(stock - inCart, 0);
  const related = (all.data || []).filter((x) => x.id !== p.id && x.categoryId === p.categoryId).slice(0, 4);
  const images = p.images?.length ? p.images : [''];

  const add = (buyNow = false) => {
    const res = addProduct(p, qty);
    if (!res.ok) return toast.error(res.message);
    setQty(1);
    buyNow ? openCart() : toast.success(res.message);
  };

  return (
    <>
      <Seo title={p.name} description={p.shortDescription} path={`/shop/product/${p.slug}`} image={p.images?.[0]} />
      <div className="container-page py-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
          <Link to="/shop" className="hover:underline">Shop</Link>
          {category && (<><ChevronRight className="size-4" aria-hidden="true" /><Link to={`/shop/category/${category.slug}`} className="hover:underline">{category.name}</Link></>)}
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="text-ink-800" aria-current="page">{p.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SmartImage src={images[imgIndex]} alt={images[imgIndex] ? p.name : ''} kind="product" eager className="aspect-square w-full rounded-2xl border border-ink-100" iconClass="size-24" />
            {images.length > 1 && (
              <ul className="mt-3 flex gap-3 overflow-x-auto">
                {images.map((src, i) => (
                  <li key={src}>
                    <button type="button" onClick={() => setImgIndex(i)} aria-label={`Show image ${i + 1}`} aria-current={i === imgIndex} className={`block overflow-hidden rounded-md border-2 ${i === imgIndex ? 'border-ayur-700' : 'border-transparent'}`}>
                      <img src={src} alt="" className="size-16 object-cover" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            {category && <p className="mb-2 text-xs font-semibold tracking-wide text-ayur-700 uppercase">{category.name}</p>}
            <h1 className="text-3xl font-semibold sm:text-4xl">{p.name}</h1>
            <div className="mt-4"><PriceTag product={p} large /></div>
            <p className="mt-1 text-xs text-ink-500">Inclusive of applicable taxes. Shipping calculated at checkout.</p>

            <p className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${inStock ? 'text-ayur-700' : 'text-danger-600'}`}>
              <span className={`size-2 rounded-full ${inStock ? 'bg-ayur-500' : 'bg-danger-600'}`} aria-hidden="true" />
              {!inStock ? 'Out of stock' : stock <= settings.lowStockThreshold ? `Only ${stock} left` : 'In stock'}
            </p>

            {p.shortDescription && <p className="mt-5 text-base leading-relaxed text-ink-700">{p.shortDescription}</p>}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {inStock && maxAddable > 0 && <QuantitySelector value={qty} max={maxAddable} onChange={(v) => setQty(Math.min(Math.max(v, 1), maxAddable))} />}
              <Button tone="ayurveda" size="lg" onClick={() => add(false)} disabled={!inStock || maxAddable === 0} className="flex-1 sm:flex-none">
                <ShoppingBag className="size-5" aria-hidden="true" />
                {!inStock ? 'Out of stock' : maxAddable === 0 ? 'Maximum in cart' : 'Add to cart'}
              </Button>
              {inCart > 0 && <Button variant="outline" tone="ayurveda" size="lg" onClick={openCart}>View cart ({inCart})</Button>}
            </div>

            {p.sku && <p className="mt-5 text-xs text-ink-500">SKU: {p.sku}</p>}
            {p.isDemo && <p className="mt-4 inline-block rounded bg-gold-500/15 px-2.5 py-1 text-sm font-medium text-gold-600">Sample product — placeholder content</p>}

            <div className="mt-8 space-y-6 border-t border-ink-100 pt-6">
              {p.description && <div><h2 className="mb-2 font-sans text-base font-semibold">Description</h2><p className="text-sm leading-relaxed whitespace-pre-line text-ink-700">{p.description}</p></div>}
              {p.usageInformation && <div><h2 className="mb-2 font-sans text-base font-semibold">Usage information</h2><p className="text-sm leading-relaxed whitespace-pre-line text-ink-700">{p.usageInformation}</p></div>}
              {p.ingredients && <div><h2 className="mb-2 font-sans text-base font-semibold">Ingredients</h2><p className="text-sm leading-relaxed whitespace-pre-line text-ink-700">{p.ingredients}</p></div>}
            </div>
            <Disclaimer />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-6 text-2xl font-semibold">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((r) => <ProductCard key={r.id} product={r} categoryName={category?.name} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
