"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PanelLeft } from "lucide-react";
import { CanvasCard } from "@/components/canvas/canvas-card";
import { CreateCanvasModal } from "@/components/canvas/create-canvas-modal";
import { Sidebar } from "@/components/sidebar";
import { Id } from "convex/_generated/dataModel";

export default function CanvasPage() {
  const canvases = useQuery(api.canvases.list);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null);

  const filteredCanvases = canvases?.filter((canvas) =>
    canvas.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (id: Id<"conversations">) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Backdrop overlay for mobile when sidebar is open */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Overlay on mobile, beside content on larger screens */}
      <aside className={`
        fixed md:relative
        inset-y-0 left-0
        z-50 md:z-auto
        w-[280px]
        transition-transform duration-300 ease-in-out md:transition-all
        ${isSidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-0' : 'translate-x-0 md:w-[280px]'}
      `}>
        <Sidebar
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onToggleCollapse={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-background relative">
        {isSidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute left-4 top-4 z-10 h-8 w-8 hover:bg-black/10 dark:hover:bg-white/5"
          >
            <PanelLeft className="h-5 w-5 text-foreground" />
          </Button>
        )}

        {/* Header */}
        <div className="border-b border-border px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-semibold text-foreground">Canvas</h1>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                + New canvas
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search canvases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Canvas Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Sort by
                <Button variant="ghost" size="sm" className="ml-2">
                  Activity ▾
                </Button>
              </span>
            </div>

            {filteredCanvases === undefined ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : filteredCanvases.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {searchQuery ? "No canvases found" : "No canvases yet"}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCanvases.map((canvas) => (
                  <CanvasCard key={canvas._id} canvas={canvas} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Canvas Modal */}
        <CreateCanvasModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </div>
  );
}
