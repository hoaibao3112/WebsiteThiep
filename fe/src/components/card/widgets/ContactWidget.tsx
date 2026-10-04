"use client";

import React from "react";
import { Phone, MessageCircle, Mail, Send, ExternalLink } from "lucide-react";
import type { CanvasWidgetConfig } from "@/types/canvas.types";

interface Props {
  config: CanvasWidgetConfig;
  heading?: React.ReactNode;
}

export function ContactWidget({ config, heading }: Props) {
  const title = config.contactTitle || config.title;
  const subtitle = config.contactSubtitle || config.description;
  const style = config.contactStyle || "buttons-row";
  const size = config.contactButtonSize || "md";
  const showLabel = config.contactShowLabel !== false;

  // Fallback if no contactChannels defined: use config.phone
  const channels = config.contactChannels && config.contactChannels.length > 0
    ? config.contactChannels.filter(c => c.enabled !== false)
    : config.phone
    ? [
        {
          id: "default-phone",
          type: "phone" as const,
          label: "Gọi Điện",
          value: config.phone,
          enabled: true,
          sortOrder: 0,
          buttonColor: "#2563EB",
        },
      ]
    : [];

  const getChannelUrl = (type: string, val: string) => {
    const cleaned = val.replace(/[\s()-]/g, "");
    switch (type) {
      case "phone":
        return `tel:${cleaned}`;
      case "zalo":
        return cleaned.startsWith("http") ? cleaned : `https://zalo.me/${cleaned}`;
      case "messenger":
        return cleaned.startsWith("http") ? cleaned : `https://m.me/${cleaned}`;
      case "whatsapp":
        return cleaned.startsWith("http") ? cleaned : `https://wa.me/${cleaned.replace(/^\+/, "")}`;
      case "email":
        return `mailto:${cleaned}`;
      case "telegram":
        return cleaned.startsWith("http") ? cleaned : `https://t.me/${cleaned.replace(/^@/, "")}`;
      default:
        return cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className={size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"} />;
      case "zalo":
      case "messenger":
      case "whatsapp":
        return <MessageCircle className={size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"} />;
      case "email":
        return <Mail className={size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"} />;
      case "telegram":
        return <Send className={size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"} />;
      default:
        return <ExternalLink className={size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"} />;
    }
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-xs gap-2",
    lg: "px-4.5 py-2.5 text-sm gap-2.5",
  }[size];

  if (channels.length === 0) {
    return (
      <div className="flex size-full flex-col items-center justify-center p-3 text-center text-stone-400">
        <Phone className="size-6 mb-1 text-stone-300" />
        <span className="text-xs font-medium">Chưa có số liên hệ</span>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col items-center justify-center p-3 text-center">
      {heading || (title && <h3 className="text-sm font-bold text-stone-800 mb-0.5">{title}</h3>)}
      {subtitle && <p className="text-[11px] text-stone-500 mb-2.5 line-clamp-2 max-w-[280px]">{subtitle}</p>}

      {style === "buttons-grid" ? (
        <div className="grid w-full grid-cols-2 gap-2">
          {channels.map((c) => (
            <a
              key={c.id}
              href={getChannelUrl(c.type, c.value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-xl font-medium text-white shadow-xs transition hover:brightness-110 active:scale-97 ${sizeClasses}`}
              style={{ backgroundColor: c.buttonColor || "#1E293B" }}
            >
              {getChannelIcon(c.type)}
              {showLabel && <span className="truncate">{c.label}</span>}
            </a>
          ))}
        </div>
      ) : style === "list" ? (
        <div className="flex w-full flex-col gap-1.5">
          {channels.map((c) => (
            <a
              key={c.id}
              href={getChannelUrl(c.type, c.value)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-xs text-stone-800 shadow-2xs hover:bg-stone-50 transition"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex size-7 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: c.buttonColor || "#1E293B" }}
                >
                  {getChannelIcon(c.type)}
                </span>
                <span className="font-medium">{c.label}</span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">{c.value}</span>
            </a>
          ))}
        </div>
      ) : (
        /* buttons-row (default) */
        <div className="flex flex-wrap items-center justify-center gap-2">
          {channels.map((c) => (
            <a
              key={c.id}
              href={getChannelUrl(c.type, c.value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center rounded-full font-medium text-white shadow-xs transition hover:brightness-110 active:scale-97 ${sizeClasses}`}
              style={{ backgroundColor: c.buttonColor || "#1E293B" }}
            >
              {getChannelIcon(c.type)}
              {showLabel && <span className="truncate">{c.label}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
