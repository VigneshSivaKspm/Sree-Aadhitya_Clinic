import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import { CheckboxField, TextField } from '../components/ui/FormField';
import { PageHero } from '../components/ui/Section';
import Seo from '../components/ui/Seo';
import { useCart } from '../contexts/CartContext';
import { useSite } from '../contexts/SiteContext';
import { useToast } from '../contexts/ToastContext';
import { placeOrder } from '../services/orderService';
import { AppError, getErrorMessage, logError } from '../utils/errors';
import { saveOrderLocally } from '../utils/storage';
import { hasErrors, validators } from '../utils/validators';
import { OrderSummary } from './CartPage';

const initial = {
  name: '', phone: '', email: '',
  addressLine: '', area: '', city: '', district: '', state: '', postalCode: '', landmark: '',
  paymentMethod: '', agree: false,
};

function validate(v) {
  return {
    name: validators.name(v.name, 'Full name'),
    phone: validators.phone(v.phone),
    email: validators.email(v.email),
    addressLine: validators.text(v.addressLine, { label: 'Address', min: 3, max: 200, required: true }),
    area: validators.text(v.area, { label: 'Area', min: 2, max: 100, required: true }),
    city: validators.text(v.city, { label: 'City', min: 2, max: 100, required: true }),
    district: validators.text(v.district, { label: 'District', min: 2, max: 100, required: true }),
    state: validators.text(v.state, { label: 'State', min: 2, max: 100, required: true }),
    postalCode: validators.postalCode(v.postalCode),
    landmark: validators.text(v.landmark, { label: 'Landmark', max: 150 }),
    paymentMethod: v.paymentMethod ? '' : 'Please choose a payment method.',
    agree: v.agree ? '' : 'Please confirm to place your order.',
  };
}

export default function CheckoutPage() {
  const { items, replaceItems, clearCart } = useCart();
  const { settings } = useSite();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [problems, setProblems] = useState([]);
  const [submitError, setSubmitError] = useState('');

  if (items.length === 0 && !submitting) return <Navigate to="/cart" replace />;

  const errors = validate(values);
  const show = (f) => (touched[f] || submitted ? errors[f] : '');
  const bind = (f) => ({
    value: values[f],
    onChange: (e) => setValues((v) => ({ ...v, [f]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [f]: true })),
    error: show(f),
    tone: 'ayurveda',
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setSubmitError('');
    setProblems([]);
    if (hasErrors(errors)) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer: { name: values.name, phone: values.phone, email: values.email },
        address: values,
        items,
        paymentMethod: values.paymentMethod,
        shipping: settings.shipping,
      });
      saveOrderLocally(order);
      clearCart();
      navigate(`/order-success?code=${order.id}`, { replace: true, state: { order } });
    } catch (err) {
      logError('checkout', err);
      if (err instanceof AppError && err.code === 'cart-changed') {
        replaceItems(err.details.verified);
        setProblems(err.details.issues.map((i) => i.message));
        toast.error('Your cart was updated. Please review it and place the order again.');
        if (!err.details.verified.length) navigate('/cart');
      } else {
        setSubmitError(getErrorMessage(err, 'We couldn’t place your order. Please try again or contact us.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Checkout" path="/checkout" noindex />
      <PageHero tone="ayurveda" eyebrow="Shop" title="Checkout" />
      <form onSubmit={onSubmit} noValidate className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {problems.length > 0 && (
            <div role="alert" className="rounded-lg border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-ink-800">
              <p className="mb-2 flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" aria-hidden="true" /> Your cart has been updated</p>
              <ul className="list-disc space-y-1 pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}

          <fieldset className="rounded-xl border border-ink-100 bg-white p-6">
            <legend className="px-2 font-sans text-lg font-semibold">Contact details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Full name" required autoComplete="name" className="sm:col-span-2" {...bind('name')} />
              <TextField label="Mobile number" required type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" {...bind('phone')} />
              <TextField label="Email (optional)" type="email" autoComplete="email" {...bind('email')} />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-ink-100 bg-white p-6">
            <legend className="px-2 font-sans text-lg font-semibold">Delivery address</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Address (house / street)" required autoComplete="address-line1" className="sm:col-span-2" {...bind('addressLine')} />
              <TextField label="Area / locality" required autoComplete="address-line2" {...bind('area')} />
              <TextField label="Landmark (optional)" {...bind('landmark')} />
              <TextField label="City / town" required autoComplete="address-level2" {...bind('city')} />
              <TextField label="District" required {...bind('district')} />
              <TextField label="State" required autoComplete="address-level1" {...bind('state')} />
              <TextField label="PIN code" required inputMode="numeric" maxLength={6} autoComplete="postal-code" {...bind('postalCode')} />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-ink-100 bg-white p-6">
            <legend className="px-2 font-sans text-lg font-semibold">Payment</legend>
            <p className="mb-4 text-sm text-ink-600">No payment is taken on this website. Choose how you would like to pay.</p>
            <div className="space-y-3">
              {settings.paymentMethods.map((m) => (
                <label key={m.key} className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ayur-700 ${values.paymentMethod === m.key ? 'border-ayur-600 bg-ayur-50' : 'border-ink-200 hover:bg-ink-50'}`}>
                  <input type="radio" name="paymentMethod" value={m.key} checked={values.paymentMethod === m.key} onChange={() => setValues((v) => ({ ...v, paymentMethod: m.key }))} className="mt-1 accent-ayur-700" />
                  <span><span className="block text-sm font-semibold text-ink-900">{m.label}</span><span className="block text-sm text-ink-600">{m.help}</span></span>
                </label>
              ))}
            </div>
            {show('paymentMethod') && <p className="mt-2 text-sm text-danger-600" role="alert">{show('paymentMethod')}</p>}
          </fieldset>

          <CheckboxField tone="ayurveda" checked={values.agree} onChange={(e) => setValues((v) => ({ ...v, agree: e.target.checked }))} error={show('agree')}
            label={<>I confirm the details above are correct and I agree to the <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy-policy" className="underline">privacy policy</Link>.</>} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary items={items} shipping={settings.shipping} />
          {submitError && <p role="alert" className="rounded-md border border-danger-600/20 bg-danger-50 px-4 py-3 text-sm text-danger-700">{submitError}</p>}
          <Button type="submit" tone="ayurveda" size="lg" loading={submitting} className="w-full">{submitting ? 'Placing order…' : 'Place order'}</Button>
          <p className="text-xs text-ink-500">Your order is a request until our team confirms it. Prices and availability are checked again when you place the order.</p>
        </div>
      </form>
    </>
  );
}
