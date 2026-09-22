import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AsyncBlock } from "../components/common/Sections";
import { ServiceCard } from "../components/practice/Cards";
import { Disclaimer } from "../components/practice/PracticeSections";
import { PageHero } from "../components/ui/Section";
import Seo from "../components/ui/Seo";
import { DemoNotice, EmptyState } from "../components/ui/States";
import { PRACTICES } from "../config/site";
import { useServices } from "../hooks/useCatalog";

export default function ServicesPage({ practice }) {
  const p = PRACTICES[practice];
  const q = useServices(practice);
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return (q.data || []).filter(
      (s) =>
        !needle ||
        `${s.name} ${s.shortDescription}`.toLowerCase().includes(needle),
    );
  }, [q.data, term]);

  return (
    <>
      <Seo
        title={`${practice === "dental" ? "Dental" : "Ayurvedic"} treatments`}
        description={`Treatments offered at ${p.name}.`}
        path={p.servicesPath}
      />
      <PageHero
        tone={practice}
        eyebrow={p.name}
        title={
          practice === "dental" ? "Dental treatments" : "Ayurvedic treatments"
        }
        description="Browse our treatments and book a consultation. Suitability of any treatment is decided by your doctor after examination."
      />
      <div className="container-page py-12">
        <div className="relative mb-8 max-w-md">
          <label htmlFor="svc-search" className="sr-only">
            Search treatments
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            id="svc-search"
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search treatments"
            className="h-11 w-full rounded-md border border-ink-300 bg-white pr-3 pl-10 text-sm focus:ring-2 focus:ring-ink-200 focus:outline-none"
          />
        </div>
        <DemoNotice show={(q.data || []).some((s) => s.isDemo)} />
        <AsyncBlock
          query={q}
          empty={
            <EmptyState
              title="Treatments coming soon"
              message="Our list of treatments will appear here shortly."
            />
          }
        >
          {() =>
            filtered.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            ) : (
              <EmptyState
                image="/empty-no-results.png"
                title="No treatments match your search"
                message="Try a different keyword."
              />
            )
          }
        </AsyncBlock>
        <Disclaimer />
      </div>
    </>
  );
}
