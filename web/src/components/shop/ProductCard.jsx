import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import SmartImage from '../ui/SmartImage';

export const isInStock = (p) => p.inStock !== false && Number(p.stockQuantity) > 0;

export function PriceTag({ product, large = false }) {
  const hasDiscount = Number(product.compareAtPrice) > Number(product.price);
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-semibold text-ink-900 ${large ? 'text-2xl' : 'text-base'}`}>{formatCurrency(product.price)}</span>
      {hasDiscount && (
        <>
          <s className="text-sm text-ink-500" aria-label={`Original price ${formatCurrency(product.compareAtPrice)}`}>
            {formatCurrency(product.compareAtPrice)}
          </s>
          <span className="text-sm font-medium text-ayur-700">
            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
          </span>
        </>
      )}
    </p>
  );
}

export default function ProductCard({ product, categoryName }) {
  const { addProduct } = useCart();
  const toast = useToast();
  const inStock = isInStock(product);

  const add = () => {
    const res = addProduct(product, 1);
    res.ok ? toast.success(`${product.name} added to cart.`) : toast.error(res.message);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition-shadow hover:shadow-md">
      <Link to={`/shop/product/${product.slug}`} className="relative block" aria-label={product.name}>
        <SmartImage src={product.images?.[0]} alt="" kind="product" className="aspect-square w-full" iconClass="size-14" />
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-900 px-2.5 py-1 text-xs font-medium text-white">Out of stock</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {categoryName && <p className="mb-1 text-xs font-medium tracking-wide text-ayur-700 uppercase">{categoryName}</p>}
        <h3 className="font-sans text-base font-semibold text-ink-900">
          <Link to={`/shop/product/${product.slug}`} className="hover:underline">{product.name}</Link>
        </h3>
        {product.shortDescription && <p className="mt-1 line-clamp-2 text-sm text-ink-600">{product.shortDescription}</p>}
        <div className="mt-auto pt-4">
          <PriceTag product={product} />
          <Button tone="ayurveda" size="sm" className="mt-3 w-full" onClick={add} disabled={!inStock} aria-label={inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}>
            <ShoppingBag className="size-4" aria-hidden="true" />
            {inStock ? 'Add to cart' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, categories = [] }) {
  const catName = (id) => categories.find((c) => c.id === id)?.name;
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} categoryName={catName(p.categoryId)} />
      ))}
    </div>
  );
}
