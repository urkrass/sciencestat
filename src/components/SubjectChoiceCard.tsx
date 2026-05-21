import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight } from "lucide-react";

type SubjectChoiceCardProps = {
  description: string;
  href: string;
  icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  label: string;
  title: string;
};

export function SubjectChoiceCard({
  description,
  href,
  icon: Icon,
  label,
  title
}: SubjectChoiceCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[18rem] flex-col justify-between rounded-lg border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-moss hover:shadow-sheet focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            {label}
          </p>
          <span className="flex h-12 w-12 items-center justify-center rounded-md border border-line bg-paper text-moss transition group-hover:border-moss group-hover:bg-moss group-hover:text-white">
            <Icon aria-hidden className="h-6 w-6" />
          </span>
        </div>
        <h2 className="heading-serif mt-6 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <span className="mt-8 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-moss bg-moss px-4 text-sm font-semibold text-white transition group-hover:bg-moss-dark">
        Open book
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}
