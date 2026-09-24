import { useSearchParams } from "react-router-dom";
import { AsyncBlock } from "../components/common/Sections";
import { DoctorCard } from "../components/practice/Cards";
import { PageHero } from "../components/ui/Section";
import { BRAND } from "../config/site";
import Seo from "../components/ui/Seo";
import { DemoNotice, EmptyState } from "../components/ui/States";
import { toneFor } from "../config/theme";
import { useDoctors } from "../hooks/useCatalog";

const FILTERS = [
  { key: "", label: "All doctors" },
  { key: "ayurveda", label: "Ayurveda" },
  { key: "dental", label: "Dental" },
];

export default function DoctorsPage() {
  const [params, setParams] = useSearchParams();
  const practice = ["ayurveda", "dental"].includes(params.get("practice"))
    ? params.get("practice")
    : "";
  const q = useDoctors(practice || undefined);

  return (
    <>
      <Seo
        title="Our doctors"
        description={`Meet the doctors at ${BRAND.fullName}.`}
        path="/doctors"
      />
      <PageHero
        eyebrow="Our team"
        title="Our doctors"
        description="Qualified practitioners across our Ayurvedic and dental hospitals."
      />
      <div className="container-page py-12">
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter doctors by practice"
        >
          {FILTERS.map((f) => {
            const active = practice === f.key;
            const t = toneFor(f.key || "main");
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setParams(f.key ? { practice: f.key } : {})}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? `${t.solid.split(" hover")[0]} border-transparent` : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <DemoNotice show={(q.data || []).some((d) => d.isDemo)} />
        <AsyncBlock
          query={q}
          empty={
            <EmptyState
              title="Doctor profiles coming soon"
              message="Our doctors’ profiles will be listed here shortly."
            />
          }
        >
          {(items) => (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          )}
        </AsyncBlock>
      </div>
    </>
  );
}
