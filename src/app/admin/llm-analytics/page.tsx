"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { formatCurrency } from "@/lib/currency";

export default function LLMAnalyticsPage() {
  const stats = useQuery(api.aiTracking.getStats, {});

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const { summary, byUsageType, byModel } = stats;

  // Map model names to provider names
  const getProviderName = (model: string): string => {
    if (model.includes("gpt-oss-20b")) return "Hyperbolic";
    if (model.includes("gpt-oss-120b")) return "GMICloud FP4";
    if (model.includes("kimi-k2-thinking")) return "Chutes INT4 / Fireworks";
    if (model.includes("gemini")) return "Google";
    return "OpenRouter";
  };

  // Get display name for model
  const getModelDisplayName = (model: string): string => {
    if (model.includes("gpt-oss-20b")) return "FREIRE (GPT OSS 20B)";
    if (model.includes("gpt-oss-120b")) return "FREIRE (GPT OSS 120B)";
    if (model.includes("kimi-k2-thinking")) return "FREIRE PLUS (Kimi K2 Thinking)";
    if (model.includes("gemini-2.0-flash")) return "Gemini 2.0 Flash";
    return model;
  };

  // Prepare data for bar chart
  const usageTypeLabels: Record<string, string> = {
    conversation: "Conversation",
    project: "Project",
    quick_question: "Quick Question",
    canvas: "Canvas",
    title_generation: "Title Generation",
    file_analysis: "File Analysis",
  };

  const chartData = Object.entries(byUsageType).map(([type, data]) => ({
    type: usageTypeLabels[type] || type,
    tokens: data.totalTokens,
  }));

  // Find max tokens for scaling
  const maxTokens = Math.max(...chartData.map(d => d.tokens), 1);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">LLM Analytics</h1>

        {/* Provider Info */}
        <div className="mb-8 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <span><strong>Providers:</strong></span>
            <span>FREIRE → Hyperbolic</span>
            <span>FREIRE → GMICloud FP4</span>
            <span>FREIRE PLUS → Chutes INT4 / Fireworks</span>
            <span>Canvas → Google Gemini</span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Input Tokens */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Input Tokens</div>
            <div className="text-3xl font-bold mb-4">
              {summary.totalInputTokens.toLocaleString()}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost (USD):</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.totalCostUsd * (summary.totalInputTokens / summary.totalTokens || 0),
                    'USD'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost (PHP):</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.totalCostPhp * (summary.totalInputTokens / summary.totalTokens || 0),
                    'PHP'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Output Tokens */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Output Tokens</div>
            <div className="text-3xl font-bold mb-4">
              {summary.totalOutputTokens.toLocaleString()}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost (USD):</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.totalCostUsd * (summary.totalOutputTokens / summary.totalTokens || 0),
                    'USD'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost (PHP):</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.totalCostPhp * (summary.totalOutputTokens / summary.totalTokens || 0),
                    'PHP'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Reasoning Tokens */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Reasoning Tokens</div>
            <div className="text-3xl font-bold mb-4">
              {summary.totalReasoningTokens.toLocaleString()}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost (USD):</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.totalCostUsd * (summary.totalReasoningTokens / summary.totalTokens || 0),
                    'USD'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost (PHP):</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.totalCostPhp * (summary.totalReasoningTokens / summary.totalTokens || 0),
                    'PHP'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Tokens */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Tokens</div>
            <div className="text-4xl font-bold text-primary">
              {summary.totalTokens.toLocaleString()}
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Cost</div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(summary.totalCostUsd, 'USD')}
              </div>
              <div className="text-2xl font-semibold text-muted-foreground">
                {formatCurrency(summary.totalCostPhp, 'PHP')}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 bg-card border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-4">Statistics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold">{summary.totalRequests.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {summary.successfulRequests.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {summary.failedRequests.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary.avgLatencyMs.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Latency</div>
            </div>
          </div>
        </div>

        {/* Usage by Type Bar Chart */}
        <div className="mt-6 bg-card border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-6">Token Usage by Type</div>
          <div className="space-y-4">
            {chartData.map((item) => {
              const percentage = (item.tokens / maxTokens) * 100;
              return (
                <div key={item.type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{item.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-primary h-full flex items-center px-3 text-primary-foreground text-sm font-medium transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && `${percentage.toFixed(1)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Token Usage by Model */}
        <div className="mt-6 bg-card border rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-6">Token Usage by Model</div>
          <div className="space-y-6">
            {Object.entries(byModel).map(([model, data]) => (
              <div key={model} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-semibold">{getModelDisplayName(model)}</div>
                    <div className="text-sm text-muted-foreground">Provider: {getProviderName(model)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div className="font-bold text-lg">{formatCurrency(data.costUsd, 'USD')}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(data.costPhp, 'PHP')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Input Tokens</div>
                    <div className="font-semibold">{data.inputTokens.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Output Tokens</div>
                    <div className="font-semibold">{data.outputTokens.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Reasoning Tokens</div>
                    <div className="font-semibold">{data.reasoningTokens.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Tokens</div>
                    <div className="font-semibold text-primary">{data.totalTokens.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
