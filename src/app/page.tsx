"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeft, Settings } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { ProtectedLayout } from "@/components/auth/protected-layout";

// Component to handle URL search params
function ConversationFromUrl({ setActiveConversationId }: { setActiveConversationId: (id: Id<"conversations"> | null) => void }) {
  const searchParams = useSearchParams();
  const conversationFromUrl = searchParams.get("conversation");

  useEffect(() => {
    if (conversationFromUrl) {
      setActiveConversationId(conversationFromUrl as Id<"conversations">);
    }
  }, [conversationFromUrl, setActiveConversationId]);

  return null;
}

function HomeContent() {
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [streamingConversationId, setStreamingConversationId] = useState<Id<"conversations"> | null>(null);
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Hidden for now, uncomment to re-enable

  // Handle streaming state change - track which conversation is streaming
  const handleStreamingChange = (isStreaming: boolean) => {
    if (isStreaming) {
      setStreamingConversationId(activeConversationId);
    } else {
      setStreamingConversationId(null);
    }
  };

  const handleSelectConversation = (id: Id<"conversations">) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // const toggleSettings = () => {
  //   setIsSettingsOpen(!isSettingsOpen);
  // };

  return (
    <>
      <Suspense fallback={null}>
        <ConversationFromUrl setActiveConversationId={setActiveConversationId} />
      </Suspense>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:block transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-[280px]'}`}>
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
            <Sidebar
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onToggleCollapse={toggleSidebar}
              isCollapsed={isSidebarCollapsed}
              streamingConversationId={streamingConversationId}
            />
          </div>
        </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <Sidebar
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <main className="flex-1 relative bg-background">
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
        {/* Settings Toggle Button - Hidden for now, uncomment to re-enable */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          className="absolute right-4 top-4 z-10 h-8 w-8 hover:bg-black/10 dark:hover:bg-white/5"
        >
          <Settings className="h-5 w-5 text-foreground" />
        </Button> */}
        <ChatArea
          conversationId={activeConversationId}
          isSidebarCollapsed={isSidebarCollapsed}
          onStreamingChange={handleStreamingChange}
        />
      </main>

      {/* Settings Sidebar - Hidden for now, uncomment to re-enable */}
      {/* {isSettingsOpen && (
        <aside className="hidden md:block">
          <SettingsSidebar onClose={toggleSettings} />
        </aside>
      )} */}
    </div>
    </>
  );
}

export default function Home() {
  return (
    <ProtectedLayout>
      <HomeContent />
    </ProtectedLayout>
  );
}
