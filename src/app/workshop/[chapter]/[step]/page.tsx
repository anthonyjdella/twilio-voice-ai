import { notFound } from "next/navigation";
import workshopConfig from "@/workshop.config";
import { StepContent } from "./StepContent";

interface Props {
  params: Promise<{ chapter: string; step: string }>;
}

export function generateStaticParams() {
  const params: { chapter: string; step: string }[] = [];
  for (const chapter of workshopConfig.chapters) {
    for (const step of chapter.steps) {
      params.push({ chapter: chapter.slug, step: step.slug });
    }
  }
  return params;
}

export default async function StepPage({ params }: Props) {
  const { chapter: chapterSlug, step: stepSlug } = await params;

  const chapter = workshopConfig.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) notFound();
  const step = chapter.steps.find((s) => s.slug === stepSlug);
  if (!step) notFound();

  return <StepContent chapterSlug={chapterSlug} stepSlug={stepSlug} />;
}
