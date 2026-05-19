import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, ExternalLink, FileText } from "lucide-react";
import { CourseSidebar } from "@/components/CourseSidebar";
import { PdfViewerShell } from "@/components/PdfViewerShell";
import {
  getAdjacentStatisticsUnits,
  getStatisticsUnit,
  statisticsUnits
} from "@/content/statisticsUnits";

type UnitPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const baseButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition";

export function generateStaticParams() {
  return statisticsUnits.map((unit) => ({
    slug: unit.slug
  }));
}

export async function generateMetadata({ params }: UnitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const unit = getStatisticsUnit(slug);

  if (!unit) {
    return {
      title: "Unit Not Found"
    };
  }

  return {
    title: `Unit ${String(unit.number).padStart(2, "0")}: ${unit.title}`,
    description: unit.description
  };
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { slug } = await params;
  const unit = getStatisticsUnit(slug);

  if (!unit) {
    notFound();
  }

  const { previous, next } = getAdjacentStatisticsUnits(unit);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/courses/statistics-for-scientific-claims"
          className="inline-flex items-center gap-2 text-sm font-medium text-moss hover:text-moss-dark"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to course
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <CourseSidebar activeSlug={unit.slug} />
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
              Unit {String(unit.number).padStart(2, "0")}
            </p>
            <h1 className="heading-serif mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {unit.title}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{unit.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={unit.pdfPath}
                download
                className={`${baseButtonClass} border-moss bg-moss text-white hover:bg-moss-dark`}
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download PDF
              </a>
              {unit.hasTex ? (
                <a
                  href={unit.texPath}
                  download
                  className={`${baseButtonClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
                >
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  Download LaTeX source
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  role="link"
                  title="LaTeX source file was not found in this workspace."
                  className={`${baseButtonClass} cursor-not-allowed border-line bg-slate-100 text-slate-400`}
                >
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  Download LaTeX source
                </span>
              )}
              <a
                href={unit.pdfPath}
                target="_blank"
                rel="noreferrer"
                className={`${baseButtonClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
              >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Open PDF in new tab
              </a>
            </div>
          </section>

          <PdfViewerShell file={unit.pdfPath} title={unit.title} />

          <nav
            aria-label="Adjacent units"
            className="grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/courses/statistics-for-scientific-claims/${previous.slug}`}
                className="rounded-lg border border-line bg-white p-4 transition hover:border-moss hover:text-moss"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Previous unit
                </span>
                <span className="mt-2 block text-base font-semibold text-ink">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span className="rounded-lg border border-line bg-slate-100 p-4 text-sm text-slate-400">
                No previous unit
              </span>
            )}
            {next ? (
              <Link
                href={`/courses/statistics-for-scientific-claims/${next.slug}`}
                className="rounded-lg border border-line bg-white p-4 text-right transition hover:border-moss hover:text-moss"
              >
                <span className="flex items-center justify-end gap-2 text-sm font-medium">
                  Next unit
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mt-2 block text-base font-semibold text-ink">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span className="rounded-lg border border-line bg-slate-100 p-4 text-right text-sm text-slate-400">
                No next unit
              </span>
            )}
          </nav>
        </div>
      </div>
    </main>
  );
}
