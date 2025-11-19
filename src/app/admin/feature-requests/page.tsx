"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { FeatureRequestCard } from "@/components/admin/feature-request-card";
import { FeatureRequestDetailModal } from "@/components/admin/feature-request-detail-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

type FeatureStatus = "pending" | "in-progress" | "for-review" | "resolved";

const columns: { id: FeatureStatus; title: string }[] = [
  { id: "pending", title: "Pending" },
  { id: "in-progress", title: "In Progress" },
  { id: "for-review", title: "For Review" },
  { id: "resolved", title: "Resolved" },
];

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

function DraggableCard({
  id,
  feature,
  onClick,
  onDelete,
}: {
  id: string;
  feature: Doc<"featureRequests">;
  onClick: () => void;
  onDelete: (id: Doc<"featureRequests">["_id"]) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <FeatureRequestCard feature={feature} onClick={onClick} onDelete={onDelete} />
    </div>
  );
}

export default function FeatureRequestsPage() {
  const [selectedFeature, setSelectedFeature] = useState<Doc<"featureRequests"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<Doc<"featureRequests"> | null>(null);

  const featureRequests = useQuery(api.featureRequests.list) ?? [];
  const updateStatus = useMutation(api.featureRequests.updateStatus);
  const deleteFeature = useMutation(api.featureRequests.remove);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleCardClick = (feature: Doc<"featureRequests">) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleDelete = (featureId: Doc<"featureRequests">["_id"]) => {
    deleteFeature({ featureRequestId: featureId });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const feature = featureRequests.find((f) => f._id === event.active.id);
    setActiveFeature(feature || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveFeature(null);
    const { active, over } = event;

    if (!over) return;

    const featureId = active.id as Doc<"featureRequests">["_id"];
    const newStatus = over.id as FeatureStatus;

    updateStatus({
      featureRequestId: featureId,
      status: newStatus,
    });
  };

  const getFeaturesByStatus = (status: FeatureStatus) => {
    return featureRequests.filter((feature) => feature.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        <div className="border-b bg-background px-8 py-6">
          <h1 className="text-3xl font-bold">Feature Requests</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage feature requests from users
          </p>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex gap-4 p-6 min-w-max">
            {columns.map((column) => {
              const columnFeatures = getFeaturesByStatus(column.id);

              return (
                <div key={column.id} className="flex-1 min-w-[320px] w-[320px] flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-lg">{column.title}</h2>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {columnFeatures.length}
                    </span>
                  </div>

                  <DroppableColumn id={column.id}>
                    <ScrollArea className="h-[calc(100vh-240px)]">
                      <div className="space-y-3 pr-4">
                        {columnFeatures.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                            No feature requests in this column
                          </div>
                        ) : (
                          columnFeatures.map((feature) => (
                            <DraggableCard
                              key={feature._id}
                              id={feature._id}
                              feature={feature}
                              onClick={() => handleCardClick(feature)}
                              onDelete={handleDelete}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
        </div>

        <FeatureRequestDetailModal
          feature={selectedFeature}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>

      <DragOverlay>
        {activeFeature ? <FeatureRequestCard feature={activeFeature} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
