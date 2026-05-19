export type SimulationStatus = "available" | "comingSoon";

export type Simulation = {
  slug: string;
  title: string;
  status: SimulationStatus;
  description: string;
  href?: string;
};

export const simulations: Simulation[] = [
  {
    slug: "sampling-distribution",
    title: "Sampling distribution",
    status: "available",
    description:
      "Change sample size and number of repeated samples to see how sample means vary around a population mean.",
    href: "/courses/statistics-for-scientific-claims/simulations/sampling-distribution"
  },
  {
    slug: "confidence-intervals",
    title: "Confidence intervals",
    status: "available",
    description:
      "See how often confidence intervals capture the true parameter over repeated sampling.",
    href: "/courses/statistics-for-scientific-claims/simulations/confidence-intervals"
  },
  {
    slug: "p-value-null-model",
    title: "P-value under a null model",
    status: "available",
    description:
      "Simulate results under a null hypothesis and compare an observed statistic to the null distribution.",
    href: "/courses/statistics-for-scientific-claims/simulations/p-value-null-model"
  }
];

export function getSimulation(slug: string) {
  return simulations.find((simulation) => simulation.slug === slug) ?? null;
}
