import { redirect } from "next/navigation";
import { chapters } from "@/content/chapters";

export default function WorkshopIndex() {
  const first = chapters[0];
  redirect(`/workshop/${first.slug}/${first.steps[0].slug}`);
}
