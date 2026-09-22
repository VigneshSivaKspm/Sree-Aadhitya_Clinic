import { Link } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import QuantitySelector from "../components/ui/QuantitySelector";
import { PageHero } from "../components/ui/Section";
import Seo from "../components/ui/Seo";
import SmartImage from "../components/ui/SmartImage";
import { EmptyState } from "../components/ui/States";
import { useCart } from "../contexts/CartContext";
import { useSite } from "../contexts/SiteContext";
import { formatCurrency } from "../utils/format";
import { calcTotals } from "../utils/pricing";

export function OrderSummary({ items, shipping, showItems = true }) {
  const { subtotal, shippingFee, total } = calcTotals(items, shipping);
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-6">
      <h2 className="font-sans text-lg font-semibold">Order summary</h2>
      {showItems && (
        <ul className="mt-4 divide-y divide-ink-100">
          {items.map((i) => (
            <li
              key={i.productId}
              className="flex justify-between gap-4 py-3 text-sm"
            >
              <span className="text-ink-700">
                {i.name} <span className="text-ink-500">× {i.quantity}</span>
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-600">Subtotal</dt>
          <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">Shipping</dt>
          <dd className="tabular-nums">
            {shippingFee ? formatCurrency(shippingFee) : "Free"}
          </dd>
        </div>
        {shipping.enabled &&
          shipping.freeAbove > 0 &&
          subtotal < shipping.freeAbove && (
            <p className="text-xs text-ayur-700">
              Add {formatCurrency(shipping.freeAbove - subtotal)} more for free
              shipping.
            </p>
          )}
        <div className="flex justify-between border-t border-ink-100 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatCurrency(total)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function CartPage() {
  const { items, setQuantity, removeItem } = useCart();
  const { settings } = useSite();

  return (
    <>
      <Seo title="Your cart" path="/cart" noindex />
      <PageHero tone="ayurveda" eyebrow="Shop" title="Your cart" />
      <div className="container-page py-10">
        {items.length === 0 ? (
          <EmptyState
            image="/empty-cart.png"
            title="Your cart is empty"
            message="Browse our Ayurvedic products and add something you like."
            action={
              <Button to="/shop" tone="ayurveda">
                Browse the shop
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <SmartImage
                    src={item.image}
                    alt=""
                    kind="product"
                    className="size-24 shrink-0 rounded-md"
                    iconClass="size-8"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <Link
                        to={`/shop/product/${item.slug}`}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-600">
                        {formatCurrency(item.price)} each
                      </p>
                      {item.quantity >= item.maxQty && (
                        <p className="mt-1 text-xs text-gold-600">
                          Maximum available quantity
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <QuantitySelector
                        value={item.quantity}
                        max={item.maxQty}
                        onChange={(q) => setQuantity(item.productId, q)}
                        label={`Quantity of ${item.name}`}
                      />
                      <p className="w-24 text-right font-semibold tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="flex size-9 items-center justify-center rounded-md text-ink-500 hover:bg-danger-50 hover:text-danger-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <OrderSummary
                items={items}
                shipping={settings.shipping}
                showItems={false}
              />
              <Button
                to="/checkout"
                tone="ayurveda"
                size="lg"
                className="w-full"
              >
                Proceed to checkout
              </Button>
              <Button
                to="/shop"
                variant="ghost"
                tone="ayurveda"
                className="w-full"
              >
                Continue shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
