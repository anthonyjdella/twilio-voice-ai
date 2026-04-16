import { redirect } from "next/navigation";
import workshopConfig from "@/workshop.config";

export default function WorkshopIndex() {
  const first = workshopConfig.chapters[0];
  redirect(`/workshop/${first.slug}/${first.steps[0].slug}`);
}
