import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SubjectChoiceCardProps = {
  description: string;
  href: string;
  iconAlt: string;
  iconSrc: string;
  label: string;
  title: string;
};

export function SubjectChoiceCard({
  description,
  href,
  iconAlt,
  iconSrc,
  label,
  title
}: SubjectChoiceCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[18rem] flex-col rounded-lg border border-line bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-moss hover:shadow-sheet focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
        {label}
      </p>
      <div className="flex flex-1 flex-col items-center justify-center py-5">
        <img
          src={iconSrc}
          alt={iconAlt}
          className="h-28 w-28 object-contain transition duration-200 group-hover:scale-[1.03] sm:h-36 sm:w-36"
        />
        <h2 className="heading-serif mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <span className="mx-auto mt-2 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-moss bg-moss px-4 text-sm font-semibold text-white transition group-hover:bg-moss-dark">
        Open book
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}
