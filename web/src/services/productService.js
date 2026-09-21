import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { demoCategories, demoProducts } from '../config/demoData';
import { AppError } from '../utils/errors';
import { byOrder, getDb, mapDoc, withDemo } from './base';

const byFeaturedThenName = (a, b) =>
  Number(!!b.featured) - Number(!!a.featured) || String(a.name).localeCompare(String(b.name));

/** All active products (capped). Search/category filtering happens client-side. */
export function listProducts() {
  return withDemo(
    async () => {
      const snap = await getDocs(query(collection(getDb(), 'products'), where('active', '==', true), limit(300)));
      return snap.docs.map(mapDoc).sort(byFeaturedThenName);
    },
    () => demoProducts,
  );
}

export function listCategories() {
  return withDemo(
    async () => {
      const snap = await getDocs(query(collection(getDb(), 'productCategories'), where('active', '==', true)));
      return snap.docs.map(mapDoc).sort(byOrder);
    },
    () => demoCategories,
  );
}

export function getProductBySlug(slug) {
  return withDemo(
    async () => {
      const snap = await getDocs(
        query(collection(getDb(), 'products'), where('active', '==', true), where('slug', '==', slug), limit(1)),
      );
      return snap.empty ? null : mapDoc(snap.docs[0]);
    },
    () => demoProducts.find((p) => p.slug === slug) || null,
  );
}

/**
 * Re-reads live product documents for the given cart lines and returns the
 * authoritative price/stock, plus a list of human-readable issues.
 */
export async function verifyCartItems(items) {
  const db = getDb();
  const issues = [];
  const verified = [];

  await Promise.all(
    items.map(async (line) => {
      let product = null;
      try {
        const snap = await getDoc(doc(db, 'products', line.productId));
        product = snap.exists() ? { id: snap.id, ...snap.data() } : null;
      } catch (err) {
        // Inactive products are unreadable to the public (permission-denied).
        if (err?.code !== 'permission-denied') throw err;
      }

      if (!product || product.active !== true) {
        issues.push({ productId: line.productId, message: `“${line.name}” is no longer available and was removed.`, remove: true });
        return;
      }
      const stock = Number(product.stockQuantity) || 0;
      if (product.inStock === false || stock <= 0) {
        issues.push({ productId: line.productId, message: `“${product.name}” is out of stock and was removed.`, remove: true });
        return;
      }
      let quantity = line.quantity;
      if (quantity > stock) {
        quantity = stock;
        issues.push({ productId: line.productId, message: `Only ${stock} of “${product.name}” are available. Quantity updated.`, quantity });
      }
      if (Number(product.price) !== Number(line.price)) {
        issues.push({ productId: line.productId, message: `The price of “${product.name}” has changed.` });
      }
      verified.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku || '',
        image: product.images?.[0] || '',
        price: Number(product.price),
        quantity,
        maxQty: stock,
      });
    }),
  );

  if (!items.length) throw new AppError('Your cart is empty.', 'empty-cart');
  return { verified, issues };
}
