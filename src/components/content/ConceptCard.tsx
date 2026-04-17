"use client";

import Image from "next/image";
import { renderMarkdown } from "@/lib/markdown";

interface ConceptCardProps {
  title: string;
  content: string;
  illustration?: string;
}

export function ConceptCard({ title, content, illustration }: ConceptCardProps) {
  return (
    <div className="rounded-xl border border-navy-border bg-gradient-to-br from-surface-2 to-surface-1 overflow-hidden mb-6">
      <div className="flex flex-col md:flex-row">
        {/* Illustration */}
        {illustration && (
          <div className="md:w-48 shrink-0 flex items-center justify-center p-6 bg-surface-1">
            <Image
              src={illustration}
              alt={title}
              width={160}
              height={160}
              className="opacity-80"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5">
          <h3 className="font-display font-extrabold text-lg text-text-primary mb-3">
            {title}
          </h3>
          <div className="text-sm text-text-secondary leading-relaxed [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_strong]:text-text-primary [&_strong]:font-bold [&_a]:text-twilio-blue [&_a:hover]:underline">
            {renderMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
}
