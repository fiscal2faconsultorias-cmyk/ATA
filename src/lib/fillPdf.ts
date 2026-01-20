import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

type FillData = Record<string, string>;

function wrapText(text: string, maxWidth: number, font: any, size: number) {
  const words = text.replace(/\r/g, "").split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(tentative, size);
    if (width <= maxWidth) {
      current = tentative;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function fillPdfAndDownload(nomeArquivo: string, dados: FillData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();
  const margin = 56;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyColor = rgb(0.82, 0.86, 0.9);
  const headingColor = rgb(0.58, 0.95, 0.83);

  let cursorY = height - margin;
  const maxTextWidth = width - margin * 2;

  const drawLine = (text: string, opts?: { size?: number; leading?: number; bold?: boolean; color?: any }) => {
    const size = opts?.size ?? 12;
    const leading = opts?.leading ?? 18;
    const color = opts?.color ?? bodyColor;
    const fontToUse = opts?.bold ? fontBold : font;
    const lines = wrapText(text, maxTextWidth, fontToUse, size);
    for (const line of lines) {
      page.drawText(line, { x: margin, y: cursorY, size, font: fontToUse, color });
      cursorY -= leading;
    }
  };

  drawLine("ATA DE DISTRIBUIÇÃO DE LUCROS", { size: 18, leading: 26, bold: true, color: headingColor });
  drawLine(`Empresa: ${dados.razao_social || "-"}`, { bold: true });
  drawLine(`CNPJ: ${dados.cnpj || "-"}`);
  drawLine(`Data: ${dados.data || "-"}`);
  drawLine(`Valor: ${dados.valor || "-"}`);
  drawLine(`Valor por extenso: ${dados.valor_extenso || "-"}`);

  cursorY -= 10;
  const textoAta = (dados.ata_texto || "").trim() || "Ata gerada. Use o modo OpenRouter para um texto mais detalhado.";
  drawLine("Texto da ata:", { bold: true, color: headingColor });
  drawLine(textoAta, { size: 12, leading: 16 });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, `${nomeArquivo}.pdf`);
}
