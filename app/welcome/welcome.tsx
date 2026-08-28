import Banner from "./banner.png";
import { getEvents } from "../../server/events";
import { useEffect, useState } from "react";
import { Card } from "~/components/Card";
import { PageHeader } from "~/components/PageHeader";
import { Input } from "~/components/Input";
import { CardSkeleton } from "~/components/Skeleton";
import { encryptId } from "~/utils/idCrypto";

interface Guest {
  name: string;
  arrived: boolean;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  location?: string;
  img: string;
  guests?: Record<string, Guest>;
}

export function Welcome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await getEvents();
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const categories = ["all", ...Array.from(new Set(events.map((e) => e.category?.toLowerCase()).filter(Boolean)))];

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === "all" || (event.category && event.category.toLowerCase() === selectedCategory);
    const term = search.toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(term) ||
      (event.location && event.location.toLowerCase().includes(term)) ||
      (event.description && event.description.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="flex w-full flex-col items-center pb-20">
      {/* Hero Banner Section */}
      <div className="relative w-full overflow-hidden bg-neutral-900">
        <img
          src={Banner}
          alt="Event Banner"
          className="aspect-2/1 w-full object-cover opacity-90 sm:aspect-3/1 lg:aspect-4/1"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/70 via-transparent to-transparent flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-8">
            <h1 className="text-2xl font-extrabold text-white sm:text-4xl drop-shadow-md">
              Discover & Join Memorable Events
            </h1>
            <p className="mt-1 max-w-lg text-sm text-neutral-200 drop-shadow-sm">
              Seamlessly sign up, receive your instant door QR ticket, and check in effortlessly.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <PageHeader title="Explore Events" />

          {/* Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search events, cities, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-pill px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500 text-white shadow-soft"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Grid List with Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-0 p-12 text-center shadow-card my-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-neutral-800">No events found</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Try adjusting your search query or selecting a different category.
            </p>
            {(search || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-4 text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event) => (
              <li key={event.id}>
                <Card
                  href={`/view/${encryptId(event.id)}`}
                  image={event.img}
                  title={event.title}
                  date={event.date}
                  location={event.location}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}