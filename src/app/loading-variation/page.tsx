"use client";

import { RippleLoader } from "@/components/ui/ripple-loader";
import { BlobLoader } from "@/components/ui/blob-loader";
import { BreathingCircleLoader } from "@/components/ui/breathing-circle-loader";
import { HexagonLoader } from "@/components/ui/hexagon-loader";
import { StarLoader } from "@/components/ui/star-loader";
import { FlowerLoader } from "@/components/ui/flower-loader";
import { CubeLoader } from "@/components/ui/cube-loader";

export default function LoadingVariationPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Loading Variations</h1>
          <p className="text-muted-foreground">
            Exploring different loading animation styles with various configurations
          </p>
        </div>

        {/* All Loaders Side by Side - Small Size */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">All Loaders Comparison</h2>
            <p className="text-muted-foreground">Small size, side by side for easy comparison</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <BlobLoader size="sm" />
              <span className="text-xs font-medium">Blob</span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <RippleLoader size="sm" />
              <span className="text-xs font-medium">Ripple</span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <BreathingCircleLoader size="sm" />
              <span className="text-xs font-medium">Breathing</span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <CubeLoader size="sm" />
              <span className="text-xs font-medium">Cube</span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <HexagonLoader size="sm" />
              <span className="text-xs font-medium">Hexagon</span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <StarLoader size="sm" />
              <span className="text-xs font-medium">Star</span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card">
              <FlowerLoader size="sm" />
              <span className="text-xs font-medium">Flower</span>
            </div>
          </div>

          {/* Speed Comparison */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Speed Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground text-center">Slow</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <BlobLoader size="sm" speed="slow" />
                    <span className="text-xs">Blob</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CubeLoader size="sm" speed="slow" />
                    <span className="text-xs">Cube</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <BreathingCircleLoader size="sm" speed="slow" />
                    <span className="text-xs">Breathing</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <StarLoader size="sm" speed="slow" />
                    <span className="text-xs">Star</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground text-center">Normal</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <BlobLoader size="sm" speed="normal" />
                    <span className="text-xs">Blob</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CubeLoader size="sm" speed="normal" />
                    <span className="text-xs">Cube</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <BreathingCircleLoader size="sm" speed="normal" />
                    <span className="text-xs">Breathing</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <StarLoader size="sm" speed="normal" />
                    <span className="text-xs">Star</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground text-center">Fast</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <BlobLoader size="sm" speed="fast" />
                    <span className="text-xs">Blob</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CubeLoader size="sm" speed="fast" />
                    <span className="text-xs">Cube</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <BreathingCircleLoader size="sm" speed="fast" />
                    <span className="text-xs">Breathing</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <StarLoader size="sm" speed="fast" />
                    <span className="text-xs">Star</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t-2 border-border"></div>

        {/* Blob Loader Section */}
        <section className="space-y-8 p-8 rounded-lg border-2 border-primary/20 bg-primary/5">
          <div>
            <h2 className="text-3xl font-bold mb-2">Blob Loader (Asymmetric)</h2>
            <p className="text-muted-foreground">Organic, morphing shapes that expand and rotate</p>
          </div>

          {/* Blob Size Variations */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Size Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Small</h4>
                <BlobLoader size="sm" />
                <code className="text-xs">size="sm"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Medium (Default)</h4>
                <BlobLoader size="md" />
                <code className="text-xs">size="md"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Large</h4>
                <BlobLoader size="lg" />
                <code className="text-xs">size="lg"</code>
              </div>
            </div>
          </div>

          {/* Blob Color Variations */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Color Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Primary (Default)</h4>
                <BlobLoader variant="primary" />
                <code className="text-xs">variant="primary"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Muted</h4>
                <BlobLoader variant="muted" />
                <code className="text-xs">variant="muted"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Accent</h4>
                <BlobLoader variant="accent" />
                <code className="text-xs">variant="accent"</code>
              </div>
            </div>
          </div>

          {/* Blob Speed Variations */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Speed Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Slow</h4>
                <BlobLoader speed="slow" />
                <code className="text-xs">speed="slow"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Normal (Default)</h4>
                <BlobLoader speed="normal" />
                <code className="text-xs">speed="normal"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Fast</h4>
                <BlobLoader speed="fast" />
                <code className="text-xs">speed="fast"</code>
              </div>
            </div>
          </div>

          {/* Blob Ring Count */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ring Count Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">2 Blobs</h4>
                <BlobLoader rings={2} />
                <code className="text-xs">rings={2}</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">3 Blobs (Default)</h4>
                <BlobLoader rings={3} />
                <code className="text-xs">rings={3}</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">4 Blobs</h4>
                <BlobLoader rings={4} />
                <code className="text-xs">rings={4}</code>
              </div>
            </div>
          </div>

          {/* Blob Combined */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Combined Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Large + Slow + Accent</h4>
                <BlobLoader size="lg" speed="slow" variant="accent" />
                <code className="text-xs">size="lg" speed="slow" variant="accent"</code>
              </div>

              <div className="flex flex-col items-center gap-4 p-8 rounded-lg border bg-card">
                <h4 className="text-sm font-medium text-muted-foreground">Small + Fast + 4 Blobs</h4>
                <BlobLoader size="sm" speed="fast" rings={4} />
                <code className="text-xs">size="sm" speed="fast" rings={4}</code>
              </div>
            </div>
          </div>

          {/* Blob on Dark Background */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">On Dark Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-slate-900">
                <h4 className="text-sm font-medium text-slate-300">Primary</h4>
                <BlobLoader variant="primary" />
              </div>

              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-slate-900">
                <h4 className="text-sm font-medium text-slate-300">Muted</h4>
                <BlobLoader variant="muted" />
              </div>

              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-slate-900">
                <h4 className="text-sm font-medium text-slate-300">Accent</h4>
                <BlobLoader variant="accent" />
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t-2 border-border"></div>

        {/* Ripple Loader Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ripple Loader (Symmetric)</h2>
            <p className="text-muted-foreground">Classic expanding rings with uniform growth</p>
          </div>

        {/* Size Variations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Size Variations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Small</h4>
              <RippleLoader size="sm" />
              <code className="text-xs">size="sm"</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Medium (Default)</h4>
              <RippleLoader size="md" />
              <code className="text-xs">size="md"</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Large</h4>
              <RippleLoader size="lg" />
              <code className="text-xs">size="lg"</code>
            </div>
          </div>
        </div>

        {/* Color Variations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Color Variations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Primary (Default)</h4>
              <RippleLoader variant="primary" />
              <code className="text-xs">variant="primary"</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Muted</h4>
              <RippleLoader variant="muted" />
              <code className="text-xs">variant="muted"</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Accent</h4>
              <RippleLoader variant="accent" />
              <code className="text-xs">variant="accent"</code>
            </div>
          </div>
        </div>

        {/* Speed Variations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Speed Variations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Slow</h4>
              <RippleLoader speed="slow" />
              <code className="text-xs">speed="slow"</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Normal (Default)</h4>
              <RippleLoader speed="normal" />
              <code className="text-xs">speed="normal"</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">Fast</h4>
              <RippleLoader speed="fast" />
              <code className="text-xs">speed="fast"</code>
            </div>
          </div>
        </div>

        {/* Ring Count Variations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Ring Count Variations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">2 Rings</h4>
              <RippleLoader rings={2} />
              <code className="text-xs">rings={2}</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">3 Rings (Default)</h4>
              <RippleLoader rings={3} />
              <code className="text-xs">rings={3}</code>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
              <h4 className="text-sm font-medium text-muted-foreground">4 Rings</h4>
              <RippleLoader rings={4} />
              <code className="text-xs">rings={4}</code>
            </div>
          </div>
        </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">Usage Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold mb-4">BlobLoader</h3>
              <pre className="text-sm overflow-x-auto">
                <code>{`import { BlobLoader } from "@/components/ui/blob-loader";

// Basic usage
<BlobLoader />

// With custom props
<BlobLoader
  size="lg"
  variant="accent"
  speed="slow"
  rings={4}
/>`}</code>
              </pre>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold mb-4">RippleLoader</h3>
              <pre className="text-sm overflow-x-auto">
                <code>{`import { RippleLoader } from "@/components/ui/ripple-loader";

// Basic usage
<RippleLoader />

// With custom props
<RippleLoader
  size="lg"
  variant="primary"
  speed="normal"
  rings={3}
/>`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
