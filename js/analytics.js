// Analytics integration for GA4 and Meta Pixel, listening strictly to events.
// Uses config.js and events.js without DOM dependencies or direct business logic.
// Respects config.analytics settings and suppresses tracking during tests or demo mode.

import { CONFIG } from "../config.js";
import { on } from "./events.js";

let initialized = false;

/**
 * Initializes GA4 and Meta Pixel tracking by listening to event bus emissions.
 */
export function initAnalytics() {
  if (initialized) return;

  // Never track in test or demo modes
  const params = new URLSearchParams(window.location.search);
  if (params.get("test") === "1" || params.get("demo") === "1" || params.get("present") === "1") {
    return;
  }

  const { ga4Id, metaPixelId } = CONFIG.analytics;

  // Initialize GA4 if ID is present
  if (ga4Id && typeof ga4Id === "string" && ga4Id.trim().length > 0) {
    initGA4(ga4Id.trim());
  }

  // Initialize Meta Pixel if ID is present
  if (metaPixelId && typeof metaPixelId === "string" && metaPixelId.trim().length > 0) {
    initMetaPixel(metaPixelId.trim());
  }

  // Bind Event Listeners
  on("pack:selected", ({ packId, source = "home" }) => {
    trackGA4("game_start", { pack: packId, source });
    trackMeta("trackCustom", "GameStart", { pack: packId });
  });

  on("snippet:answered", ({ challenge, result, seconds }) => {
    const pack = challenge.id.startsWith("b") ? "b" : "d";
    trackGA4("snippet_answer", {
      pack,
      challenge_id: challenge.id,
      result,
      seconds
    });
  });

  on("round:done", ({ packId, score, total }) => {
    trackGA4("game_complete", { pack: packId, score, total });
    trackMeta("trackCustom", "GameComplete", { pack: packId, score });
  });

  on("whatsapp:click", ({ pack, score }) => {
    trackGA4("whatsapp_sales_click", { pack, score });
    trackMeta("track", "Lead", { content_name: "Catch the AI WhatsApp Lead" });
  });

  on("website:click", ({ spot }) => {
    trackGA4("website_click", { spot });
  });

  on("session:click", () => {
    trackGA4("session_click");
  });

  on("share:image", ({ size }) => {
    trackGA4("share_image", { size });
  });

  on("share:whatsapp", () => {
    trackGA4("share_whatsapp");
  });

  on("share:copy", () => {
    trackGA4("copy_link");
  });

  on("challenge:open", ({ pack, has_beat }) => {
    trackGA4("challenge_link_open", { pack, has_beat });
  });

  initialized = true;
}

function initGA4(id) {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());

  const cleanLocation = window.location.origin + window.location.pathname;
  gtag("config", id, { page_location: cleanLocation });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

function initMetaPixel(id) {
  if (window.fbq) return;

  const n = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  window.fbq = n;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", id);
  window.fbq("track", "PageView");
}

function trackGA4(eventName, params = {}) {
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, params);
    } catch {}
  }
}

function trackMeta(method, eventName, params = {}) {
  if (typeof window.fbq === "function") {
    try {
      window.fbq(method, eventName, params);
    } catch {}
  }
}
