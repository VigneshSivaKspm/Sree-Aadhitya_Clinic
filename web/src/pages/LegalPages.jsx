import { PageHero, Section } from '../components/ui/Section';
import Seo from '../components/ui/Seo';

function Placeholder({ title, path, children }) {
  return (
    <>
      <Seo title={title} path={path} />
      <PageHero eyebrow="Legal" title={title} />
      <Section>
        <div className="mx-auto max-w-3xl space-y-5 text-ink-700">
          <p className="rounded-md border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm">
            <strong>Placeholder.</strong> This page is a template only. Replace it with content approved by the hospitals’ legal advisers before launch.
          </p>
          {children}
        </div>
      </Section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <Placeholder title="Privacy policy" path="/privacy-policy">
      <p>This policy will explain what personal information the hospitals collect through this website, why it is collected, how long it is kept and who can access it.</p>
      <h2 className="font-sans text-lg font-semibold">Information collected</h2>
      <p>Appointment requests (name, mobile number, optional email, preferred date/time and notes), store orders (contact and delivery details, items ordered) and website enquiries. We aim to collect only what is needed to respond to you.</p>
      <h2 className="font-sans text-lg font-semibold">Who can see it</h2>
      <p>Only authorised staff of the relevant hospital can view appointment and order information. It is not published on this website.</p>
      <h2 className="font-sans text-lg font-semibold">Your choices</h2>
      <p>Contact details and the process for requesting access, correction or deletion will be added here.</p>
    </Placeholder>
  );
}

export function TermsPage() {
  return (
    <Placeholder title="Terms & conditions" path="/terms">
      <p>These terms will cover use of this website, appointment requests, store orders, shipping, cancellations and returns.</p>
      <h2 className="font-sans text-lg font-semibold">Appointments</h2>
      <p>An appointment request is not confirmed until the hospital confirms it.</p>
      <h2 className="font-sans text-lg font-semibold">Orders</h2>
      <p>An order is a request until confirmed by the store team. Payment methods, shipping charges and return policy will be added here.</p>
      <h2 className="font-sans text-lg font-semibold">Medical information</h2>
      <p>Information on this website is for general awareness only and is not medical advice.</p>
    </Placeholder>
  );
}
