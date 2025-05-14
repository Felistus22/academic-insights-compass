
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a PDF from HTML elements with proper error handling for empty elements
 */
export async function generatePdfFromElement(element: HTMLElement | null, scale: number = 2) {
  if (!element) {
    throw new Error("Element not found");
  }
  
  // Wait for any charts or images to render completely
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Import dynamically to reduce initial load time
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;
  
  const canvas = await html2canvas(element, {
    scale: scale,
    logging: false,
    useCORS: true,
    allowTaint: true,
  });
  
  // Check if the canvas dimensions are valid
  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error("Generated canvas has invalid dimensions");
  }
  
  const imgData = canvas.toDataURL("image/jpeg", 1.0);
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  // Ensure we have valid dimensions before calculating ratio
  if (imgWidth > 0 && imgHeight > 0) {
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    return pdf;
  } else {
    throw new Error("Cannot generate PDF: Invalid image dimensions");
  }
}

