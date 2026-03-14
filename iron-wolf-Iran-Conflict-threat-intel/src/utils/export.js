/**
 * Export utilities for Threat Intel Brief.
 * Uses an iframe to isolate from Tailwind CSS 4's oklch() colors
 * which html2canvas cannot parse.
 */
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Download the brief as a PDF file.
 *
 * @param {HTMLElement} element - DOM node to capture (.brief-output)
 */
export async function downloadPdf(element) {
  if (!element) return;

  const clone = element.cloneNode(true);

  // Remove streaming cursors and print-hidden elements
  clone.querySelectorAll(".animate-pulse").forEach((el) => el.remove());
  clone.querySelectorAll(".print\\:hidden").forEach((el) => el.remove());

  // Save visual info before stripping Tailwind classes
  clone.querySelectorAll("[class]").forEach((el) => {
    const cls = typeof el.className === "string" ? el.className : "";

    // Preserve border-left colors (section accents)
    if (cls.includes("border-l-")) {
      if (cls.includes("border-red")) el.dataset.pdfBorder = "#ef4444";
      else if (cls.includes("border-orange")) el.dataset.pdfBorder = "#f97316";
      else if (cls.includes("border-amber")) el.dataset.pdfBorder = "#f59e0b";
      else if (cls.includes("border-purple")) el.dataset.pdfBorder = "#a855f7";
      else if (cls.includes("border-blue")) el.dataset.pdfBorder = "#3b82f6";
      else if (cls.includes("border-cyan")) el.dataset.pdfBorder = "#06b6d4";
      else if (cls.includes("border-green")) el.dataset.pdfBorder = "#22c55e";
      else if (cls.includes("border-zinc")) el.dataset.pdfBorder = "#71717a";
    }

    // Preserve section header accent colors
    if (cls.includes("text-red-4")) el.dataset.pdfAccent = "#f87171";
    else if (cls.includes("text-orange-4")) el.dataset.pdfAccent = "#fb923c";
    else if (cls.includes("text-amber-4")) el.dataset.pdfAccent = "#fbbf24";
    else if (cls.includes("text-purple-4")) el.dataset.pdfAccent = "#c084fc";
    else if (cls.includes("text-blue-4")) el.dataset.pdfAccent = "#60a5fa";
    else if (cls.includes("text-cyan-4")) el.dataset.pdfAccent = "#22d3ee";
    else if (cls.includes("text-green-4")) el.dataset.pdfAccent = "#4ade80";
    else if (cls.includes("text-pink-4")) el.dataset.pdfAccent = "#f472b6";
    else if (cls.includes("text-indigo-4")) el.dataset.pdfAccent = "#818cf8";
    else if (cls.includes("text-slate-3")) el.dataset.pdfAccent = "#cbd5e1";
    else if (cls.includes("text-teal-4")) el.dataset.pdfAccent = "#2dd4bf";
    else if (cls.includes("text-rose-4")) el.dataset.pdfAccent = "#fb7185";

    // Preserve impact level badge colors
    if (cls.includes("bg-red-600")) el.dataset.pdfBadge = "#dc2626";
    else if (cls.includes("bg-orange-600")) el.dataset.pdfBadge = "#ea580c";
    else if (cls.includes("bg-yellow-600")) el.dataset.pdfBadge = "#ca8a04";
    else if (cls.includes("bg-green-600")) el.dataset.pdfBadge = "#16a34a";
    else if (cls.includes("bg-emerald-700")) el.dataset.pdfBadge = "#047857";
    else if (cls.includes("bg-zinc-600")) el.dataset.pdfBadge = "#52525b";

    // Preserve sector card backgrounds (dark tinted)
    if (cls.includes("bg-amber-950")) el.dataset.pdfCardBg = "#2a1a08";
    else if (cls.includes("bg-purple-950")) el.dataset.pdfCardBg = "#1a0a2e";
    else if (cls.includes("bg-pink-950")) el.dataset.pdfCardBg = "#2a0a18";
    else if (cls.includes("bg-indigo-950")) el.dataset.pdfCardBg = "#141230";
    else if (cls.includes("bg-blue-950")) el.dataset.pdfCardBg = "#101830";
    else if (cls.includes("bg-slate-800")) el.dataset.pdfCardBg = "#1e293b";
    else if (cls.includes("bg-orange-950")) el.dataset.pdfCardBg = "#2a1408";
    else if (cls.includes("bg-green-950")) el.dataset.pdfCardBg = "#082a14";
    else if (cls.includes("bg-teal-950")) el.dataset.pdfCardBg = "#082a28";
    else if (cls.includes("bg-rose-950")) el.dataset.pdfCardBg = "#2a0810";

    // Preserve sector card border colors
    if (cls.includes("border-amber-7")) el.dataset.pdfCardBorder = "#b45309";
    else if (cls.includes("border-purple-7")) el.dataset.pdfCardBorder = "#7e22ce";
    else if (cls.includes("border-pink-7")) el.dataset.pdfCardBorder = "#be185d";
    else if (cls.includes("border-indigo-7")) el.dataset.pdfCardBorder = "#4338ca";
    else if (cls.includes("border-blue-7")) el.dataset.pdfCardBorder = "#1d4ed8";
    else if (cls.includes("border-slate-6")) el.dataset.pdfCardBorder = "#475569";
    else if (cls.includes("border-orange-7")) el.dataset.pdfCardBorder = "#c2410c";
    else if (cls.includes("border-green-7")) el.dataset.pdfCardBorder = "#15803d";
    else if (cls.includes("border-teal-7")) el.dataset.pdfCardBorder = "#0f766e";
    else if (cls.includes("border-rose-7")) el.dataset.pdfCardBorder = "#be123c";

    // Mark grid containers
    if (cls.includes("grid")) el.dataset.pdfGrid = "1";

    // Mark section cards
    if (cls.includes("section-card")) el.dataset.pdfSection = "1";

    // Mark document header
    if (cls.includes("doc-header")) el.classList.add("pdf-doc-header");
    else el.removeAttribute("class");
  });
  clone.removeAttribute("class");

  // Create isolated iframe
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:0;top:0;width:1100px;height:1px;z-index:-1;border:none;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  await new Promise((r) => {
    iframe.onload = r;
    iframe.srcdoc = "<!DOCTYPE html><html><head></head><body></body></html>";
  });

  const iframeDoc = iframe.contentDocument;

  // Dark theme stylesheet — matches the website
  const style = iframeDoc.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; padding: 20px; width: 1050px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #f4f4f5; }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
    h3 { font-size: 15px; font-weight: 600; margin-bottom: 6px; color: #f4f4f5; }
    h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #e4e4e7; }
    p { margin-bottom: 8px; color: #ffffff; }
    span { color: #e4e4e7; }
    ul, ol { margin-bottom: 10px; padding-left: 28px; }
    li { margin-bottom: 4px; color: #ffffff; }
    a { color: #fbbf24; text-decoration: underline; font-size: 13px; }
    code { background: #27272a; padding: 1px 4px; border-radius: 3px; font-size: 12px; color: #fbbf24; }
    pre { background: #18181b; border: 1px solid #3f3f46; padding: 10px; border-radius: 6px; margin-bottom: 8px; overflow-x: auto; font-size: 12px; color: #f4f4f5; }
    strong { font-weight: 700; color: #ffffff; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
    td, th { border: 1px solid #3f3f46; padding: 5px 8px; text-align: left; color: #f4f4f5; }
    th { background: #27272a; font-weight: 600; }
    blockquote { border-left: 2px solid #f59e0b; padding-left: 10px; margin: 8px 0; color: rgba(255,255,255,0.8); font-style: italic; }
    svg { display: none; }

    /* Section cards — dark bg with colored left border */
    [data-pdf-section] {
      background: rgba(39, 39, 42, 0.5);
      border-top: 1px solid #3f3f46;
      border-right: 1px solid #3f3f46;
      border-bottom: 1px solid #3f3f46;
      border-left: 4px solid #3b82f6;
      border-radius: 0 8px 8px 0;
      padding: 16px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }

    /* Document header */
    .pdf-doc-header {
      background: linear-gradient(135deg, #450a0a, #09090b);
      border: 1px solid rgba(220, 38, 38, 0.2);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 14px;
    }
    .pdf-doc-header, .pdf-doc-header * { color: white !important; }
    .pdf-doc-header p { color: #a1a1aa !important; font-size: 12px; }

    /* Sector grid */
    [data-pdf-grid] {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      align-items: stretch;
    }
    [data-pdf-card-bg] {
      border-radius: 8px;
      padding: 12px;
      page-break-inside: avoid;
    }

    /* Sector cards — flex column with centered body content */
    [data-pdf-sector-card] {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    [data-pdf-sector-header] {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
      flex-shrink: 0;
    }
    [data-pdf-sector-body] {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    [data-pdf-sector-footer] {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-shrink: 0;
      padding-top: 4px;
    }

    /* Impact badges — white text on colored background */
    [data-pdf-badge] {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 10px;
      color: white !important;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* Key metric boxes */
    [data-pdf-card-bg] div {
      color: #ffffff;
    }
  `;
  iframeDoc.head.appendChild(style);

  // Apply inline styles from data attributes
  clone.querySelectorAll("[data-pdf-border]").forEach((el) => {
    el.style.borderLeftColor = el.dataset.pdfBorder;
    el.style.borderLeftWidth = "4px";
    el.style.borderLeftStyle = "solid";
  });

  clone.querySelectorAll("[data-pdf-accent]").forEach((el) => {
    el.style.color = el.dataset.pdfAccent;
  });

  clone.querySelectorAll("[data-pdf-badge]").forEach((el) => {
    el.style.backgroundColor = el.dataset.pdfBadge;
    el.style.color = "white";
  });

  clone.querySelectorAll("[data-pdf-card-bg]").forEach((el) => {
    el.style.backgroundColor = el.dataset.pdfCardBg;
    if (el.dataset.pdfCardBorder) {
      el.style.borderColor = el.dataset.pdfCardBorder;
      el.style.borderWidth = "1px";
      el.style.borderStyle = "solid";
    }
  });

  iframeDoc.body.appendChild(clone);

  await new Promise((r) => setTimeout(r, 400));

  try {
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#09090b",
      windowWidth: 1100,
      windowHeight: iframeDoc.body.scrollHeight,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      console.error("PDF: html2canvas produced empty canvas");
      return;
    }

    const margin = 0.3;
    const usableW = 7.9;
    const usableH = 10.4;

    const imgW = usableW;
    const imgH = (canvas.height / canvas.width) * imgW;

    const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });

    // Dark page background
    const addPageBg = (doc) => {
      doc.setFillColor(9, 9, 11); // zinc-950
      doc.rect(0, 0, 8.5, 11, "F");
    };

    if (imgH <= usableH) {
      addPageBg(pdf);
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      pdf.addImage(imgData, "JPEG", margin, margin, imgW, imgH);
    } else {
      const pixelsPerPage = (usableH / imgH) * canvas.height;
      const pages = Math.ceil(canvas.height / pixelsPerPage);

      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage();
        addPageBg(pdf);

        const sliceH = Math.min(pixelsPerPage, canvas.height - i * pixelsPerPage);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceH;

        const ctx = pageCanvas.getContext("2d");
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, i * pixelsPerPage, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        const sliceImgH = (sliceH / canvas.width) * imgW;
        const imgData = pageCanvas.toDataURL("image/jpeg", 0.85);
        pdf.addImage(imgData, "JPEG", margin, margin, imgW, sliceImgH);
      }
    }

    const date = new Date().toISOString().slice(0, 10);
    pdf.save(`Iran_Conflict_Intel_Brief_${date}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
    throw err;
  } finally {
    document.body.removeChild(iframe);
  }
}
