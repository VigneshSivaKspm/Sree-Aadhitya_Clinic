import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CalendarCheck, ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import Button from "../ui/Button";
import Logo from "./Logo";

const linkBase = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
const navClass = ({ isActive }) =>
  `${linkBase} ${isActive ? "bg-ink-100 text-ink-900" : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"}`;

const treatmentLinks = [
  {
    to: "/ayurveda/services",
    label: "Siddha & Ayurvedic treatments",
    hint: "Shree Aadhitya Siddha & Ayurvedic Hospital",
    dot: "bg-ayur-600",
  },
  {
    to: "/dental/services",
    label: "Dental treatments",
    hint: "Shree Aadhitya Dental Hospital",
    dot: "bg-dental-600",
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count, openCart } = useCart();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only rounded bg-white px-3 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-2"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/ayurveda" end className={navClass}>
            Siddha & Ayurveda
          </NavLink>
          <NavLink to="/dental" end className={navClass}>
            Dental
          </NavLink>

          <div className="group relative">
            <button
              type="button"
              className={`${linkBase} inline-flex items-center gap-1 text-ink-700 hover:bg-ink-50 hover:text-ink-900`}
              aria-haspopup="true"
            >
              Treatments <ChevronDown className="size-4" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full w-72 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="rounded-lg border border-ink-100 bg-white p-2 shadow-lg">
                {treatmentLinks.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="flex items-start gap-3 rounded-md p-3 hover:bg-ink-50"
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${l.dot}`}
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink-900">
                          {l.label}
                        </span>
                        <span className="block text-xs text-ink-500">
                          {l.hint}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="relative flex size-11 items-center justify-center rounded-md text-ink-800 hover:bg-ink-50"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-ayur-700 px-1 text-[11px] font-semibold text-white tabular-nums">
                {count}
              </span>
            )}
          </button>
          <div className="hidden sm:block">
            <Button to="/appointments" size="md">
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book Appointment
            </Button>
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md text-ink-800 hover:bg-ink-50 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-ink-100 bg-white lg:hidden"
        >
          <ul className="container-page space-y-1 py-4">
            {[
              ["/", "Home", true],
              ["/ayurveda", "Siddha & Ayurveda"],
              ["/dental", "Dental"],
              ["/ayurveda/services", "Siddha & Ayurvedic treatments"],
              ["/dental/services", "Dental treatments"],
              ["/doctors", "Our doctors"],
              ["/shop", "Shop"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([to, label, end]) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={!!end || to === "/ayurveda" || to === "/dental"}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-3 text-base font-medium ${isActive ? "bg-ink-100 text-ink-900" : "text-ink-700"}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li className="pt-3">
              <Button to="/appointments" size="lg" className="w-full">
                <CalendarCheck className="size-5" aria-hidden="true" />
                Book Appointment
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
