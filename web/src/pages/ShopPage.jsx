import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PackageSearch, Search } from "lucide-react";
import { AsyncBlock } from "../components/common/Sections";
import { ProductGrid } from "../components/shop/ProductCard";
import { PageHero } from "../components/ui/Section";
import Seo from "../components/ui/Seo";
import {
  CardGridSkeleton,
  DemoNotice,
  EmptyState,
} from "../components/ui/States";
import { useCategories, useProducts } from "../hooks/useCatalog";

const SORTS = {
  featured: {
    label: "Featured",
    fn: (a, b) =>
      Number(!!b.featured) - Number(!!a.featured) ||
      a.name.localeCompare(b.name),
  },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": {
    label: "Price: high to low",
    fn: (a, b) => b.price - a.price,
  },
  name: { label: "Name (A–Z)", fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function ShopPage() {
  const { slug } = useParams();
  const products = useProducts();
  const categories = useCategories();
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState("featured");

  const category = (categories.data || []).find((c) => c.slug === slug);

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return (products.data || [])
      .filter((p) => !category || p.categoryId === category.id)
      .filter(
        (p) =>
          !needle ||
          `${p.name} ${p.shortDescription || ""} ${p.sku || ""}`
            .toLowerCase()
            .includes(needle),
      )
      .sort(SORTS[sort].fn);
  }, [products.data, category, term, sort]);

  const chip = (active) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? "border-transparent bg-ayur-700 text-white" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`;
  const title = category ? category.name : "Ayurvedic store";

  return (
    <>
      <Seo
        title={category ? `${category.name} — Shop` : "Ayurvedic store"}
        description={
          category?.description ||
          "Herbal and Ayurvedic products from Shree Aadhitya Ayurvedic Hospital."
        }
        path={slug ? `/shop/category/${slug}` : "/shop"}
      />
      <PageHero
        tone="ayurveda"
        eyebrow="Shop"
        title={title}
        description={
          category?.description ||
          "Herbal and Ayurvedic products from Shree Aadhitya Ayurvedic Hospital."
        }
      />

      <div className="container-page py-10">
        <nav
          aria-label="Product categories"
          className="mb-6 flex flex-wrap gap-2"
        >
          <Link
            to="/shop"
            className={chip(!slug)}
            aria-current={!slug ? "page" : undefined}
          >
            All products
          </Link>
          {(categories.data || []).map((c) => (
            <Link
              key={c.id}
              to={`/shop/category/${c.slug}`}
              className={chip(slug === c.slug)}
              aria-current={slug === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {!slug && (categories.data || []).length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {categories.data.map((c) => (
              <Link
                key={c.id}
                to={`/shop/category/${c.slug}`}
                className="group flex overflow-hidden rounded-xl border border-ink-100 bg-white transition hover:border-ayur-200 hover:shadow-md"
              >
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-24 w-28 shrink-0 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-1 flex-col justify-center p-3">
                  <h3 className="font-sans text-sm font-semibold text-ink-900 group-hover:text-ayur-700">
                    {c.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-500">
                    {c.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {category && category.image && (
          <div className="mb-8 flex flex-col items-center gap-6 rounded-2xl border border-ayur-100 bg-ayur-50/50 p-6 sm:flex-row">
            <img
              src={category.image}
              alt={category.name}
              className="h-28 w-40 rounded-xl object-cover shadow-sm"
            />
            <div>
              <h2 className="text-xl font-semibold text-ayur-900">
                {category.name}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-ink-600">
                {category.description}
              </p>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              id="shop-search"
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-md border border-ink-300 bg-white pr-3 pl-10 text-sm focus:border-ayur-600 focus:ring-2 focus:ring-ayur-200 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="text-sm text-ink-600">
              Sort by
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-md border border-ink-300 bg-white px-3 text-sm focus:border-ayur-600 focus:ring-2 focus:ring-ayur-200 focus:outline-none"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DemoNotice show={(products.data || []).some((p) => p.isDemo)} />
        <AsyncBlock
          query={products}
          skeleton={
            <CardGridSkeleton
              count={8}
              cols="grid-cols-2 lg:grid-cols-4"
              imageClass="aspect-square h-auto"
            />
          }
          empty={
            <EmptyState
              icon={PackageSearch}
              title="No products yet"
              message="Our store will be stocked shortly. Please check back soon."
            />
          }
        >
          {() =>
            visible.length ? (
              <>
                <p className="mb-4 text-sm text-ink-500" aria-live="polite">
                  {visible.length} product{visible.length === 1 ? "" : "s"}
                </p>
                <ProductGrid
                  products={visible}
                  categories={categories.data || []}
                />
              </>
            ) : (
              <EmptyState
                image="/empty-no-results.png"
                title="No products found"
                message="Try a different search or category."
              />
            )
          }
        </AsyncBlock>
      </div>
    </>
  );
}
