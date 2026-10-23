import { Suspense } from "react";
import { PostEditor } from "@/components/PostEditor";

export const metadata = { title: "Editor" };

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <p className="text-[var(--t-ui)] text-ink-3">Abrindo o editor</p>
        </div>
      }
    >
      <PostEditor />
    </Suspense>
  );
}
