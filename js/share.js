// Coordinates share card interactions, size switching, Web Share API, and clipboard copy.
// Uses shareImage.js, links.js, copy.js, and config.js.
// Used by the result screen to allow players to challenge friends and export status cards.

import { CONFIG } from "../config.js";
import { t } from "./copy.js";
import { createShareImage } from "./shareImage.js";
import { challengeLink, shareText, shareWhatsAppUrl } from "./links.js";

/**
 * Creates and binds the Share Card UI.
 * @param {object} options
 * @param {number} options.score
 * @param {number} options.total
 * @param {string} options.packName
 * @param {Array} options.results
 * @param {string[]} options.challengeIds
 * @returns {HTMLElement}
 */
export function createShareCard(options) {
  const {
    score = 0,
    total = CONFIG.roundSize ?? 8,
    packName = "Beginner",
    results = [],
    challengeIds = []
  } = options;

  let selectedSize = "status"; // "status" (default) or "post"

  const card = document.createElement("div");
  card.className = "share-card";

  const title = document.createElement("h3");
  title.className = "share-title";
  title.textContent = t("share.title");
  card.appendChild(title);

  // Size Pills (Status / Post)
  const pillsContainer = document.createElement("div");
  pillsContainer.className = "share-size-pills";

  const statusPill = document.createElement("button");
  statusPill.type = "button";
  statusPill.className = "share-pill active";
  statusPill.textContent = t("share.status");

  const postPill = document.createElement("button");
  postPill.type = "button";
  postPill.className = "share-pill";
  postPill.textContent = t("share.post");

  statusPill.addEventListener("click", () => {
    selectedSize = "status";
    statusPill.classList.add("active");
    postPill.classList.remove("active");
  });

  postPill.addEventListener("click", () => {
    selectedSize = "post";
    postPill.classList.add("active");
    statusPill.classList.remove("active");
  });

  pillsContainer.appendChild(statusPill);
  pillsContainer.appendChild(postPill);
  card.appendChild(pillsContainer);

  // Buttons Container
  const buttonsWrap = document.createElement("div");
  buttonsWrap.className = "share-buttons";

  // 1. Share My Score (Web Share / Download)
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "btn btn-primary share-action-btn";
  shareBtn.textContent = t("share.image");

  shareBtn.addEventListener("click", async () => {
    shareBtn.disabled = true;
    const originalText = shareBtn.textContent;
    shareBtn.textContent = "Generating...";

    try {
      const { blob } = await createShareImage({
        score,
        total,
        packName,
        size: selectedSize,
        results
      });

      const ids = challengeIds.length > 0 ? challengeIds : results.map((r) => r.id);
      const link = challengeLink("", ids, score);
      const text = shareText(score, total, link);
      const filename = `catch-the-ai-${score}-of-${total}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Catch the AI",
            text
          });
        } catch (err) {
          // Ignore cancel/abort quietly
          if (err.name !== "AbortError") {
            downloadBlob(blob, filename);
          }
        }
      } else {
        downloadBlob(blob, filename);
      }
    } catch (err) {
      console.warn("Share generation error:", err);
    } finally {
      shareBtn.disabled = false;
      shareBtn.textContent = originalText;
    }
  });
  buttonsWrap.appendChild(shareBtn);

  // 2. Send on WhatsApp
  const waBtn = document.createElement("a");
  waBtn.className = "btn btn-outline share-action-btn";
  const ids = challengeIds.length > 0 ? challengeIds : results.map((r) => r.id);
  const link = challengeLink("", ids, score);
  const text = shareText(score, total, link);
  waBtn.href = shareWhatsAppUrl(text);
  waBtn.target = "_blank";
  waBtn.rel = "noopener noreferrer";
  waBtn.textContent = t("share.whatsapp");
  buttonsWrap.appendChild(waBtn);

  // 3. Copy Challenge Link
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "btn btn-outline share-action-btn";
  copyBtn.textContent = t("share.copy");

  copyBtn.addEventListener("click", async () => {
    const success = await copyToClipboard(link);
    if (success) {
      copyBtn.textContent = t("share.copied");
      setTimeout(() => {
        copyBtn.textContent = t("share.copy");
      }, 2000);
    }
  });
  buttonsWrap.appendChild(copyBtn);

  card.appendChild(buttonsWrap);
  return card;
}

/**
 * Downloads a binary blob to the client file system.
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies text using Clipboard API with textarea fallback.
 */
async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
