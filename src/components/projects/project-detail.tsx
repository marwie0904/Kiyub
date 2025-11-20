"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useChat } from "@ai-sdk/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Message } from "@/components/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  MoreVertical,
  Pin,
  Plus,
  Layers,
  Timer,
  ArrowUp,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  PanelLeft,
  ListChecks,
} from "lucide-react";
import { LoadingWithText } from "@/components/ui/loading-with-text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectSidebar } from "./project-sidebar";
import { CreateTestModal } from "@/components/tests/create-test-modal";
import { TestDisplayModal } from "@/components/tests/test-display-modal";
import { TestResultsModal } from "@/components/tests/test-results-modal";
import { MODEL_OPTIONS } from "@/lib/models";

interface ProjectDetailProps {
  projectId: Id<"projects">;
  initialConversationId?: Id<"conversations"> | null;
}

export function ProjectDetail({ projectId, initialConversationId }: ProjectDetailProps) {
  const router = useRouter();
  const project = useQuery(api.projects.get, { id: projectId });
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [input, setInput] = useState("");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(initialConversationId || null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [useHighReasoning, setUseHighReasoning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Test modal states
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [isTestDisplayOpen, setIsTestDisplayOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const createConversation = useMutation(api.conversations.create);
  const toggleConversationPin = useMutation(api.conversations.togglePin);
  const submitTestResponse = useMutation(api.testResponses.submit);

  const activeConversation = useQuery(
    api.conversations.get,
    activeConversationId ? { conversationId: activeConversationId } : "skip"
  );

  // Load conversation history from Convex
  const convexMessages = useQuery(
    api.messages.getAll,
    activeConversationId ? { conversationId: activeConversationId } : "skip"
  );

  const { messages, sendMessage, status, setMessages } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  // Load conversation history when activeConversationId changes
  useEffect(() => {
    if (isLoading) return;

    if (convexMessages) {
      const formattedMessages = convexMessages.map((msg) => ({
        id: msg._id,
        role: msg.role as "user" | "assistant" | "system",
        parts: [{ type: "text" as const, text: msg.content }],
        createdAt: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
      setIsLoadingConversation(false);
    } else if (activeConversationId === null) {
      setMessages([]);
      setIsLoadingConversation(false);
    }
  }, [convexMessages, activeConversationId, isLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Handler functions - defined before loading check
  const handleSelectConversation = (id: Id<"conversations">) => {
    setIsLoadingConversation(true);
    setActiveConversationId(id);
    router.push(`/projects/${projectId}?conversation=${id}`);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  };

  const handleTestCreated = (data: any) => {
    const testWithId = {
      ...data.test,
      _id: data.testId,
    };
    setCurrentTest(testWithId);
    setIsCreateTestOpen(false);
    setIsTestDisplayOpen(true);
  };

  const handleTestSubmit = async (answers: Record<string, string | string[]>) => {
    if (!currentTest || !currentTest._id || !activeConversationId) return;

    try {
      const result = await submitTestResponse({
        testId: currentTest._id as Id<"tests">,
        conversationId: activeConversationId,
        answers: JSON.stringify(answers),
      });

      setTestResult({
        score: result.score,
        totalQuestions: result.totalQuestions,
        answers,
      });

      setIsTestDisplayOpen(false);
      setIsResultsOpen(true);
    } catch (error) {
      console.error("Failed to submit test:", error);
    }
  };

  const handleRetakeTest = () => {
    setIsResultsOpen(false);
    setIsTestDisplayOpen(true);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation({
        title: "New Chat",
        projectId,
      });
      setActiveConversationId(conversationId);
    }

    sendMessage(
      {
        role: "user",
        parts: [{ type: "text" as const, text: input }],
      },
      {
        body: {
          model: selectedModel.value,
          conversationId,
          useHighReasoning,
        },
      }
    );
    setInput("");
  };

  if (!project) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`transition-all duration-300 ${isLeftSidebarCollapsed ? 'w-0' : 'w-[280px]'}`}>
          <div className={`transition-all duration-300 ${isLeftSidebarCollapsed ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
            <Sidebar
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onToggleCollapse={toggleLeftSidebar}
              isCollapsed={isLeftSidebarCollapsed}
            />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex flex-1 flex-col bg-background relative">
          {/* Header Skeleton - Full Width */}
          <div className="px-8 pt-4 pb-4 relative border-b border-border bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isLeftSidebarCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLeftSidebar}
                    className="h-8 w-8 hover:bg-white/5"
                  >
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                )}
                <Skeleton className="h-8 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className="h-8 w-8 hover:bg-white/5"
                >
                  {isRightSidebarOpen ? (
                    <PanelRightClose className="h-5 w-5" />
                  ) : (
                    <PanelRightOpen className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Chat Area Skeleton */}
            <div className="flex flex-1 flex-col relative">

              {/* Messages Area Skeleton */}
              <ScrollArea className="flex-1">
                <div className="mx-auto max-w-3xl space-y-6 px-8 py-8 pb-32">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Floating Input Area - Always Visible */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center px-8 pb-6">
                <div className="pointer-events-auto w-full max-w-3xl flex flex-col">
                  <form onSubmit={onSubmit} className="flex flex-col">
                    {/* Main Input Container */}
                    <div className="relative flex flex-col-reverse rounded-2xl shadow-lg" style={{ backgroundColor: '#21252c' }}>
                      {/* Toolbar - Now at the bottom visually but first in flex-col-reverse */}
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                            title="Attach files"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                          >
                            <Layers className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5 ${
                              useHighReasoning ? 'bg-primary/10 border-primary/50 text-primary' : ''
                            }`}
                            onClick={() => setUseHighReasoning(!useHighReasoning)}
                            title={useHighReasoning ? "High Reasoning Mode (ON)" : "High Reasoning Mode (OFF)"}
                          >
                            <Timer className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCreateTestOpen(true)}
                            disabled={!activeConversationId || messages.length === 0}
                            className="h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                            title="Create Test"
                          >
                            <ListChecks className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Model Selector */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 px-3 text-xs font-medium rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                              >
                                {selectedModel.label}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {MODEL_OPTIONS.map((model, index) => (
                                <DropdownMenuItem
                                  key={`${model.value}-${index}`}
                                  onClick={() => setSelectedModel(model)}
                                >
                                  {model.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Submit Button */}
                          <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Textarea - Positioned second in flex-col-reverse so it appears on top */}
                      <Textarea
                        ref={textareaRef}
                        placeholder="How can I help you today?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSubmit(e as any);
                          }
                        }}
                        disabled={isLoading}
                        className="min-h-[24px] max-h-[300px] resize-none border-0 bg-transparent px-4 pt-3 pb-2 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Sidebar Skeleton */}
            <aside className={`transition-all duration-300 ${isRightSidebarOpen ? 'w-[320px]' : 'w-0'}`}>
              <div className={`transition-all duration-300 ${isRightSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                <div className="h-full border-l bg-muted/30 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-32" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsRightSidebarOpen(false)}
                      className="h-8 w-8"
                    >
                      <PanelRightClose className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <aside className={`transition-all duration-300 ${isLeftSidebarCollapsed ? 'w-0' : 'w-[280px]'}`}>
        <div className={`transition-all duration-300 ${isLeftSidebarCollapsed ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
          <Sidebar
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onToggleCollapse={toggleLeftSidebar}
            isCollapsed={isLeftSidebarCollapsed}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-background relative">
        {/* Header - Full Width */}
        <div className="px-8 pt-4 pb-4 relative border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLeftSidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLeftSidebar}
                  className="h-8 w-8 hover:bg-white/5"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-lg font-normal max-w-2xl truncate">
                {project.title}
                {activeConversation?.title && (
                  <span className="text-sm text-muted-foreground"> - {activeConversation.title}</span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (activeConversationId) {
                    toggleConversationPin({ conversationId: activeConversationId });
                  }
                }}
                disabled={!activeConversationId}
              >
                <Pin className={`h-5 w-5 ${activeConversation?.isPinned ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="h-8 w-8 hover:bg-white/5"
              >
                {isRightSidebarOpen ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <PanelRightOpen className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col relative">

          {/* Chat Messages Area */}
          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-3xl space-y-6 px-8 py-8 pb-32">
              {isLoadingConversation ? (
                // Skeleton loading state
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-card/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    Start a chat to keep conversations organized and re-use project
                    knowledge.
                  </p>
                </div>
              ) : (
                messages
                  .filter((msg) => msg.role !== "system")
                  .map((msg, index) => (
                    <Message
                      key={msg.id}
                      role={msg.role as "user" | "assistant"}
                      parts={msg.parts}
                      conversationContext={messages}
                      model={selectedModel.value}
                      isStreaming={isLoading && index === messages.length - 1}
                      searchMetadata={(msg as any).searchMetadata}
                    />
                  ))
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingWithText size="sm" speed="fast" />
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Floating Input Area */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center px-8 pb-6">
            <div className="pointer-events-auto w-full max-w-3xl flex flex-col">
              <form onSubmit={onSubmit} className="flex flex-col">
                {/* Main Input Container */}
                <div className="relative flex flex-col-reverse rounded-2xl shadow-lg" style={{ backgroundColor: '#21252c' }}>
                  {/* Toolbar - Now at the bottom visually but first in flex-col-reverse */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                        title="Attach files"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5">
                        <Layers className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5 ${
                          useHighReasoning ? 'bg-primary/10 border-primary/50 text-primary' : ''
                        }`}
                        onClick={() => setUseHighReasoning(!useHighReasoning)}
                        title={useHighReasoning ? "High Reasoning Mode (ON)" : "High Reasoning Mode (OFF)"}
                      >
                        <Timer className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                        onClick={() => setIsCreateTestOpen(true)}
                        disabled={!activeConversationId || messages.length === 0}
                        title="Create Test"
                      >
                        <ListChecks className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Model Selector */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 px-3 text-xs font-medium rounded-md border border-border/40 hover:border-border hover:bg-accent/5"
                          >
                            {selectedModel.label}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {MODEL_OPTIONS.map((model, index) => (
                            <DropdownMenuItem
                              key={`${model.value}-${index}`}
                              onClick={() => setSelectedModel(model)}
                            >
                              {model.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Textarea - Positioned second in flex-col-reverse so it appears on top */}
                  <Textarea
                    ref={textareaRef}
                    placeholder="How can I help you today?"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(e as any);
                      }
                    }}
                    disabled={isLoading}
                    className="min-h-[24px] max-h-[300px] resize-none border-0 bg-transparent px-4 pt-3 pb-2 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden placeholder:text-muted-foreground/50"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

          {/* Right Sidebar */}
          <aside className={`transition-all duration-300 ${isRightSidebarOpen ? 'w-[320px]' : 'w-0'}`}>
            <div className={`transition-all duration-300 ${isRightSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
              <ProjectSidebar
                projectId={projectId}
                project={project}
                onToggle={() => setIsRightSidebarOpen(false)}
                isOpen={isRightSidebarOpen}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Test Modals */}
      <CreateTestModal
        open={isCreateTestOpen}
        onOpenChange={setIsCreateTestOpen}
        conversationId={activeConversationId}
        onTestCreated={handleTestCreated}
      />

      <TestDisplayModal
        open={isTestDisplayOpen}
        onOpenChange={setIsTestDisplayOpen}
        test={currentTest}
        onSubmit={handleTestSubmit}
      />

      <TestResultsModal
        open={isResultsOpen}
        onOpenChange={setIsResultsOpen}
        test={currentTest}
        result={testResult}
        onRetake={handleRetakeTest}
        conversationContext={messages}
        model={selectedModel.value}
      />
    </div>
  );
}
