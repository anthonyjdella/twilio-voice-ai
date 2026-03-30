import { notFound } from "next/navigation";
import { chapters, getStep } from "@/content/chapters";
import { StepContent } from "./StepContent";

interface Props {
  params: Promise<{ chapter: string; step: string }>;
}

export function generateStaticParams() {
  const params: { chapter: string; step: string }[] = [];
  for (const chapter of chapters) {
    for (const step of chapter.steps) {
      params.push({ chapter: chapter.slug, step: step.slug });
    }
  }
  return params;
}

export default async function StepPage({ params }: Props) {
  const { chapter: chapterSlug, step: stepSlug } = await params;
  const result = getStep(chapterSlug, stepSlug);
  if (!result) notFound();

  return <StepContent chapterSlug={chapterSlug} stepSlug={stepSlug} />;
}
