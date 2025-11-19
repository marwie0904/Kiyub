"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_FONTS = [
  { name: "Noticia Text", value: "noticia-text" },
  { name: "Arvo", value: "arvo" },
  { name: "Forum", value: "forum" },
  { name: "Merriweather", value: "merriweather" },
  { name: "Lora", value: "lora" },
  { name: "Crimson Text", value: "crimson-text" },
  { name: "PT Serif", value: "pt-serif" },
  { name: "Libre Baskerville", value: "libre-baskerville" },
];

interface SettingsSidebarProps {
  onClose?: () => void;
}

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const [selectedFont, setSelectedFont] = useState("noticia-text");
  const [hue, setHue] = useState(217);
  const [saturation, setSaturation] = useState(91);
  const [lightness, setLightness] = useState(60);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load saved preferences
    const savedFont = localStorage.getItem("app-font");
    const savedColor = localStorage.getItem("accent-color");

    if (savedFont) setSelectedFont(savedFont);
    if (savedColor) {
      // Parse HSL from saved color
      const [h, s, l] = savedColor.split(" ").map((v) => parseFloat(v));
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, []);

  useEffect(() => {
    drawColorWheel();
  }, [hue, saturation, lightness]);

  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 90) * (Math.PI / 180);
      const endAngle = (angle + 1 - 90) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = `hsl(${angle}, 80%, 60%)`;
      ctx.fill();
    }

    // Draw inner white circle for saturation
    const innerRadius = radius * 0.3;
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      innerRadius,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw current selection indicator
    const angle = (hue - 90) * (Math.PI / 180);
    const indicatorRadius = radius * 0.7;
    const x = centerX + Math.cos(angle) * indicatorRadius;
    const y = centerY + Math.sin(angle) * indicatorRadius;

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = canvas.width / 2 - 2;

    if (distance <= radius) {
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      const newHue = Math.round(angle);
      const newSaturation = Math.min(100, Math.round((distance / radius) * 100));

      setHue(newHue);
      setSaturation(newSaturation);

      const colorValue = `${newHue} ${newSaturation}% ${lightness}%`;
      localStorage.setItem("accent-color", colorValue);
      document.documentElement.style.setProperty("--primary", colorValue);
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    localStorage.setItem("app-font", font);

    // Apply font by updating CSS variable
    document.documentElement.style.setProperty("--font-body", font);

    // Reload to apply font change
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-[320px] flex-col bg-sidebar-secondary border-l border-border">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/5"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-foreground" />
          </Button>
        )}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Font Chooser */}
        <div className="space-y-3">
          <Label htmlFor="font-select" className="text-sm font-semibold text-foreground">
            Font Family
          </Label>
          <Select value={selectedFont} onValueChange={handleFontChange}>
            <SelectTrigger id="font-select" className="w-full">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Changes the default font for the entire application
          </p>
        </div>

        {/* Color Picker - Color Wheel */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Accent Color
          </Label>
          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              width={240}
              height={240}
              onClick={handleCanvasClick}
              className="cursor-crosshair rounded-full"
              style={{ touchAction: "none" }}
            />
            <div className="flex items-center gap-2 w-full">
              <div
                className="h-10 w-10 rounded-md border-2 border-border"
                style={{ backgroundColor: `hsl(${hue} ${saturation}% ${lightness}%)` }}
              />
              <div className="flex-1 text-xs text-muted-foreground">
                <div>H: {hue}°</div>
                <div>S: {saturation}%</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Click on the color wheel to select an accent color
          </p>
        </div>

        {/* Info Section */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            These settings are temporary and will reset when you clear your browser data.
          </p>
        </div>
      </div>
    </div>
  );
}
