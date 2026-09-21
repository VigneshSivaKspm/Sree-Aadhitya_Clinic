import { MessageCircle, Phone } from 'lucide-react';
import { BRAND, PRACTICES } from '../../config/site';
import { useSite } from '../../contexts/SiteContext';
import { telHref, whatsappHref } from '../../utils/contact';
import Button from '../ui/Button';

/** Call button — always reads the configured phone number (never hard-coded). */
export function CallButton({ practice, tone, variant = 'outline', size = 'md', label, className = '' }) {
  const { contactFor } = useSite();
  const contact = contactFor(practice);
  const href = telHref(contact.phone);
  if (!href) return null;
  return (
    <Button href={href} tone={tone ?? practice ?? 'main'} variant={variant} size={size} className={className}>
      <Phone className="size-4" aria-hidden="true" />
      {label || 'Call us'}
    </Button>
  );
}

/** WhatsApp button — uses the configured number and a pre-filled enquiry message. */
export function WhatsAppButton({ practice, tone, variant = 'outline', size = 'md', label, message, className = '' }) {
  const { contactFor } = useSite();
  const contact = contactFor(practice);
  const name = PRACTICES[practice]?.name || BRAND.fullName;
  const href = whatsappHref(contact.whatsapp, message || `Hello ${name}, I would like to make an enquiry.`);
  if (!href) return null;
  return (
    <Button href={href} target="_blank" rel="noopener noreferrer" tone={tone ?? practice ?? 'main'} variant={variant} size={size} className={className}>
      <MessageCircle className="size-4" aria-hidden="true" />
      {label || 'WhatsApp'}
    </Button>
  );
}
