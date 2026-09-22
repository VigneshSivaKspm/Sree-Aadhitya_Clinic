import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/format";
import Button from "../ui/Button";
import QuantitySelector from "../ui/QuantitySelector";
import SmartImage from "../ui/SmartImage";

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, closeCart, setQuantity, removeItem } =
    useCart();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeCart]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink-900/50"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-sans text-lg font-semibold">Your cart</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="flex size-10 items-center justify-center rounded-md hover:bg-ink-50"
            aria-label="Close cart"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <img
              src="/empty-cart.png"
              alt=""
              className="size-24 object-contain"
            />
            <p className="font-medium text-ink-900">Your cart is empty</p>
            <p className="text-sm text-ink-600">
              Browse our Ayurvedic products and add something you like.
            </p>
            <Button to="/shop" tone="ayurveda" onClick={closeCart}>
              Browse the shop
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4">
                  <SmartImage
                    src={item.image}
                    alt=""
                    kind="product"
                    className="size-20 shrink-0 rounded-md"
                    iconClass="size-7"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/shop/product/${item.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-medium text-ink-900 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink-600">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantitySelector
                        size="sm"
                        value={item.quantity}
                        max={item.maxQty}
                        onChange={(q) => setQuantity(item.productId, q)}
                        label={`Quantity of ${item.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="flex size-8 items-center justify-center rounded-md text-ink-500 hover:bg-danger-50 hover:text-danger-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-ink-100 px-5 py-5">
              <div className="flex items-center justify-between text-base">
                <span className="text-ink-600">Subtotal</span>
                <span className="font-semibold text-ink-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-ink-500">
                Shipping is calculated at checkout.
              </p>
              <Button
                to="/checkout"
                tone="ayurveda"
                size="lg"
                className="w-full"
                onClick={closeCart}
              >
                Checkout
              </Button>
              <Button
                to="/cart"
                variant="outline"
                tone="ayurveda"
                className="w-full"
                onClick={closeCart}
              >
                View cart
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
