'use client';

import { BlueprintEditor } from '@/components/blueprints/shared/BlueprintEditor';

/**
 * BlueprintEditPage - Component for editing an existing blueprint
 * Extends the creation page with loading state and pre-filled data
 *
 * @param {object} props
 * @param {string} props.blueprintId - The ID of the blueprint to edit
 */
export function BlueprintEditPage({ blueprintId }: { blueprintId: string }) {
  return (
    <BlueprintEditor 
      mode="edit"
      baseUrl={`/blueprints/edit/${blueprintId}`}
      blueprintId={blueprintId}
      onSave={async () => {
        // Implementar lógica específica para atualização de blueprints
        // console.log(`Blueprint update logic executed for ID: ${blueprintId}`);
      }}
    />
  );
}

/**
 * BlueprintEditSkeleton - Loading skeleton for the blueprint edit page
 * Moved from the original BlueprintEditPage to preserve this functionality
 */
export function BlueprintEditSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Section Navigation Skeleton */}
      <div className="h-10 w-full rounded-md bg-muted" />

      {/* Section Content Skeleton */}
      <div className="mt-6 p-6 rounded-md border">
        <div className="space-y-4">
          <div className="h-8 w-1/4 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="mt-4 h-64 w-full rounded bg-muted" />
        </div>
      </div>

      {/* Action Controls Skeleton */}
      <div className="mt-4 flex justify-between">
        <div className="h-10 w-24 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-32 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
