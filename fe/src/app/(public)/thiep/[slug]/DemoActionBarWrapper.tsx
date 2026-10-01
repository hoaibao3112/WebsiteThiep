import { Suspense } from "react";
import { DemoTemplateActionBar } from "@/components/card/DemoTemplateActionBar";

interface DemoActionBarWrapperProps {
  templateSlug: string;
  templateName?: string;
  category?: string;
}

/**
 * Client-side wrapper for DemoTemplateActionBar.
 * Mounted by the Server Component page.tsx only when the current slug
 * is a demo template (not a real user-published card).
 */
export function DemoActionBarWrapper({
  templateSlug,
  templateName,
  category,
}: DemoActionBarWrapperProps) {
  return (
    <Suspense fallback={null}>
      <DemoTemplateActionBar
        templateSlug={templateSlug}
        templateName={templateName}
        category={category}
      />
    </Suspense>
  );
}
