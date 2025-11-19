"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { BugReportCard } from "@/components/admin/bug-report-card";
import { BugReportDetailModal } from "@/components/admin/bug-report-detail-modal";
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

type BugStatus = "pending" | "in-progress" | "for-review" | "resolved";

const columns: { id: BugStatus; title: string }[] = [
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
  bug,
  onClick,
  onDelete,
}: {
  id: string;
  bug: Doc<"bugReports">;
  onClick: () => void;
  onDelete: (id: Doc<"bugReports">["_id"]) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <BugReportCard bug={bug} onClick={onClick} onDelete={onDelete} />
    </div>
  );
}

export default function BugReportsPage() {
  const [selectedBug, setSelectedBug] = useState<Doc<"bugReports"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBug, setActiveBug] = useState<Doc<"bugReports"> | null>(null);

  const bugReports = useQuery(api.bugReports.list) ?? [];
  const updateStatus = useMutation(api.bugReports.updateStatus);
  const deleteBug = useMutation(api.bugReports.remove);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleCardClick = (bug: Doc<"bugReports">) => {
    setSelectedBug(bug);
    setIsModalOpen(true);
  };

  const handleDelete = (bugId: Doc<"bugReports">["_id"]) => {
    deleteBug({ bugReportId: bugId });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const bug = bugReports.find((b) => b._id === event.active.id);
    setActiveBug(bug || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveBug(null);
    const { active, over } = event;

    if (!over) return;

    const bugId = active.id as Doc<"bugReports">["_id"];
    const newStatus = over.id as BugStatus;

    updateStatus({
      bugReportId: bugId,
      status: newStatus,
    });
  };

  const getBugsByStatus = (status: BugStatus) => {
    return bugReports.filter((bug) => bug.status === status);
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
          <h1 className="text-3xl font-bold">Bug Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage bug reports from users
          </p>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex gap-4 p-6 min-w-max">
            {columns.map((column) => {
              const columnBugs = getBugsByStatus(column.id);

              return (
                <div key={column.id} className="flex-1 min-w-[320px] w-[320px] flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-lg">{column.title}</h2>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {columnBugs.length}
                    </span>
                  </div>

                  <DroppableColumn id={column.id}>
                    <ScrollArea className="h-[calc(100vh-240px)]">
                      <div className="space-y-3 pr-4">
                        {columnBugs.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                            No bugs in this column
                          </div>
                        ) : (
                          columnBugs.map((bug) => (
                            <DraggableCard
                              key={bug._id}
                              id={bug._id}
                              bug={bug}
                              onClick={() => handleCardClick(bug)}
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

        <BugReportDetailModal
          bug={selectedBug}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>

      <DragOverlay>
        {activeBug ? <BugReportCard bug={activeBug} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
