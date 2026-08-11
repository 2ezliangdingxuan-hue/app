import { Link } from "react-router";

type CardProps = {
  href: string;
  image: string;
  title: string;
  date?: string;
  location?: string;
};

export function Card({ href, image, title, date, location }: CardProps) {
  return (
    <Link
      to={href}
      className="group block h-full w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-card transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-modal"
    >
      <div className="aspect-2/1 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h2 className="truncate text-lg font-semibold capitalize text-neutral-800">{title}</h2>
        {date && <p className="text-sm text-neutral-500">{date}</p>}
        {location && <p className="truncate text-sm text-neutral-500">{location}</p>}
      </div>
    </Link>
  );
}
