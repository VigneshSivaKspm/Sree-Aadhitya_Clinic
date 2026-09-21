import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { telHref } from '../../utils/contact';
import Logo from './Logo';

const Col = ({ title, children }) => (
  <div>
    <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide text-white uppercase">{title}</h2>
    <ul className="space-y-2.5 text-sm text-white/70">{children}</ul>
  </div>
);
const L = ({ to, children }) => (
  <li>
    <Link to={to} className="hover:text-white hover:underline">{children}</Link>
  </li>
);

export default function Footer() {
  const { settings, contactFor } = useSite();
  const c = contactFor();
  const social = Object.entries(settings.social || {}).filter(([, url]) => url);

  return (
    <footer className="bg-ink-900 text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Ayurvedic and dental care under one name, with online appointments and an Ayurvedic store.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-white/80">
            <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{c.address}</li>
            <li className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={telHref(c.phone)} className="hover:underline">{c.phone}</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={`mailto:${c.email}`} className="break-all hover:underline">{c.email}</a></li>
          </ul>
        </div>

        <Col title="Explore">
          <L to="/">Home</L>
          <L to="/doctors">Our doctors</L>
          <L to="/appointments">Book appointment</L>
          <L to="/about">About us</L>
          <L to="/contact">Contact</L>
        </Col>
        <Col title="Practices">
          <L to="/ayurveda">Ayurvedic Hospital</L>
          <L to="/ayurveda/services">Ayurvedic treatments</L>
          <L to="/dental">Dental Hospital</L>
          <L to="/dental/services">Dental treatments</L>
        </Col>
        <Col title="Shop & legal">
          <L to="/shop">Ayurvedic store</L>
          <L to="/cart">Cart</L>
          <L to="/orders">Track an order</L>
          <L to="/privacy-policy">Privacy policy</L>
          <L to="/terms">Terms &amp; conditions</L>
        </Col>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">{settings.disclaimer}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
            {social.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 capitalize hover:text-white">
                <Globe className="size-3.5" aria-hidden="true" /> {name}
              </a>
            ))}
          </div>
        </div>
        <div className="container-page pb-6 text-xs text-white/50">
          © {new Date().getFullYear()} {settings.brand.groupName}. Website by {settings.brand.developer}.
        </div>
      </div>
    </footer>
  );
}
