// Canvas renderer generating social share images for Status (1080x1920) and Post (1080x1350).
// Uses score.js, content.js, copy.js, and config.js.
// Used by share card on the result screen to generate downloadable and shareable cards.

import { CONFIG } from "../config.js";
import { getChallenge } from "./content.js";
import { rank } from "./score.js";
import { extractFilename } from "./screens/play.js";

/**
 * Draws the social share card on an off-screen canvas.
 * @param {object} options
 * @param {number} options.score
 * @param {number} [options.total=8]
 * @param {string} [options.packName="Beginner"]
 * @param {string} [options.size="status"] 'status' (1080x1920) or 'post' (1080x1350)
 * @param {Array} [options.results=[]]
 * @returns {Promise<{ canvas: HTMLCanvasElement, blob: Blob, dataUrl: string }>}
 */
export async function createShareImage(options) {
  const {
    score = 0,
    total = CONFIG.roundSize ?? 8,
    packName = "Beginner",
    size = "status",
    results = []
  } = options;

  const isStatus = size === "status";
  const width = 1080;
  const height = isStatus ? 1920 : 1350;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Background (--bg-grad)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#ECFDF5");
  bgGrad.addColorStop(0.45, "#FFFFFF");
  bgGrad.addColorStop(1, "#ECFEFF");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Brand Gradient Top Bar (6px)
  const barGrad = ctx.createLinearGradient(0, 0, width, 0);
  barGrad.addColorStop(0, "#059669");
  barGrad.addColorStop(0.5, "#0D9488");
  barGrad.addColorStop(1, "#06B6D4");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, width, 8);

  // Layout boundaries
  // Status: respect safe zones 220px top and bottom
  const startY = isStatus ? 250 : 70;
  const marginX = 80;
  const contentWidth = width - marginX * 2;

  let currentY = startY;

  // 3. Header: Logo & Title
  try {
    const logoImg = await loadLogo();
    if (logoImg) {
      const logoH = 40;
      const logoW = (logoImg.width / logoImg.height) * logoH;
      ctx.drawImage(logoImg, marginX, currentY, logoW, logoH);
      ctx.font = "800 32px ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#111827";
      ctx.fillText("Catch the AI", marginX + logoW + 20, currentY + 31);
    } else {
      ctx.font = "800 34px ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#059669";
      ctx.fillText("Wrench Wise", marginX, currentY + 30);
      ctx.fillStyle = "#111827";
      ctx.fillText("Catch the AI", marginX + 240, currentY + 30);
    }
  } catch {
    ctx.font = "800 34px ui-sans-serif, system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText("Wrench Wise", marginX, currentY + 30);
  }

  currentY += isStatus ? 90 : 70;

  // 4. Score Display ("6/8 mistakes caught")
  ctx.font = "800 130px ui-sans-serif, system-ui, -apple-system, sans-serif";
  const scoreText = String(score);
  const slashTotalText = `/${total}`;

  // Brand gradient fill for score number
  const scoreGrad = ctx.createLinearGradient(marginX, 0, marginX + 160, 0);
  scoreGrad.addColorStop(0, "#059669");
  scoreGrad.addColorStop(1, "#06B6D4");
  ctx.fillStyle = scoreGrad;
  ctx.fillText(scoreText, marginX, currentY + 110);

  const scoreMetrics = ctx.measureText(scoreText);
  ctx.font = "800 85px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#111827";
  ctx.fillText(slashTotalText, marginX + scoreMetrics.width + 12, currentY + 105);

  currentY += 160;

  ctx.font = "600 28px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#6B7280";
  ctx.fillText(score === total ? "all mistakes caught!" : "mistakes caught", marginX, currentY);

  currentY += isStatus ? 55 : 45;

  // 5. Badges (Pack Mode & Rank)
  const rankText = rank(score, total);

  // Mode badge
  drawBadge(ctx, `${packName} Mode`, marginX, currentY, {
    bgColor: "#D1FAE5",
    textColor: "#047857",
    borderColor: "#A7F3D0"
  });

  const modeBadgeWidth = ctx.measureText(`${packName} Mode`).width + 36;
  drawBadge(ctx, rankText, marginX + modeBadgeWidth + 16, currentY, {
    bgColor: "rgba(6, 182, 212, 0.12)",
    textColor: "#0891B2",
    borderColor: "#A5F3FC"
  });

  currentY += isStatus ? 80 : 65;

  // 6. Drawn Editor Card
  // Find last caught challenge or default to b01
  let snippetToDraw = null;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].result === "caught" && results[i].challenge) {
      snippetToDraw = results[i].challenge;
      break;
    }
  }
  if (!snippetToDraw) {
    snippetToDraw = getChallenge("b01");
  }

  const editorH = isStatus ? 540 : 380;
  drawEditorCard(ctx, snippetToDraw, marginX, currentY, contentWidth, editorH, isStatus);

  currentY += editorH + (isStatus ? 60 : 45);

  // 7. Statement Text
  ctx.font = "700 34px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#111827";
  const statement = `AI wrote ${total} pieces of code. I caught ${score}.`;
  ctx.fillText(statement, marginX, currentY);

  currentY += 45;

  // 8. Challenge Callout ("Can you beat me?" or "Can you match that?")
  ctx.font = "800 32px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#059669";
  const challengeCall = score === total ? "Can you match that?" : "Can you beat me?";
  ctx.fillText(challengeCall, marginX, currentY);

  // 9. Footer: Site link
  const footerY = isStatus ? height - 250 : height - 50;
  ctx.font = "600 24px ui-monospace, Menlo, Consolas, monospace";
  ctx.fillStyle = "#94A3B8";
  ctx.fillText("wrench-wise.com", marginX, footerY);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        canvas,
        blob,
        dataUrl: canvas.toDataURL("image/png")
      });
    }, "image/png");
  });
}

/**
 * Draws a pill badge with rounded corners.
 */
function drawBadge(ctx, text, x, y, style) {
  ctx.font = "700 22px ui-sans-serif, system-ui, -apple-system, sans-serif";
  const textWidth = ctx.measureText(text).width;
  const paddingX = 18;
  const h = 40;
  const w = textWidth + paddingX * 2;
  const r = 20;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = style.bgColor;
  ctx.fill();
  if (style.borderColor) {
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.fillStyle = style.textColor;
  ctx.fillText(text, x + paddingX, y + 27);
  ctx.restore();
}

/**
 * Draws the stylized dark code card.
 */
function drawEditorCard(ctx, challenge, x, y, w, h, isStatus) {
  ctx.save();

  // Card shadow
  ctx.shadowColor = "rgba(15, 23, 42, 0.15)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  // Card background
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fillStyle = "#0F172A";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Titlebar
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.roundRect(x, y, w, 48, [20, 20, 0, 0]);
  ctx.fill();

  // Dots
  const dotY = y + 24;
  ctx.fillStyle = "#64748B";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + 24 + i * 16, dotY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Filename
  const fname = extractFilename(challenge.code);
  ctx.font = "600 18px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#94A3B8";
  ctx.fillText(fname, x + 84, y + 30);

  // Code Lines
  const startCodeY = y + 80;
  const maxLines = isStatus ? Math.min(6, challenge.code.length) : Math.min(4, challenge.code.length);
  const lineHeight = isStatus ? 48 : 44;

  ctx.font = "500 20px ui-monospace, Menlo, Consolas, monospace";

  for (let i = 0; i < maxLines; i++) {
    const lineNum = i + 1;
    const lineY = startCodeY + i * lineHeight;
    const isBug = lineNum === challenge.bugLine;

    // Highlight bug line
    if (isBug) {
      ctx.fillStyle = "rgba(244, 63, 94, 0.22)";
      ctx.fillRect(x + 4, lineY - 26, w - 8, lineHeight);
    }

    // Gutter
    ctx.fillStyle = "#64748B";
    ctx.fillText(String(lineNum), x + 24, lineY);

    // Code Text
    ctx.fillStyle = isBug ? "#FDA4AF" : "#E2E8F0";
    ctx.fillText(challenge.code[i] || "", x + 64, lineY);

    // CAUGHT stamp on bug line
    if (isBug) {
      drawStamp(ctx, x + w - 160, lineY - 8);
    }
  }

  ctx.restore();
}

/**
 * Draws the CAUGHT stamp inside the editor card.
 */
function drawStamp(ctx, sx, sy) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate((-8 * Math.PI) / 180);

  ctx.strokeStyle = "#34D399";
  ctx.lineWidth = 2.5;
  ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
  ctx.beginPath();
  ctx.roundRect(-50, -18, 100, 36, 6);
  ctx.fill();
  ctx.stroke();

  ctx.font = "800 17px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#34D399";
  ctx.textAlign = "center";
  ctx.fillText("CAUGHT", 0, 7);

  ctx.restore();
}

/**
 * Helper to safely load logo image.
 * @returns {Promise<HTMLImageElement|null>}
 */
function loadLogo() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.Image) {
      return resolve(null);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/logo.png";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 200);
  });
}
