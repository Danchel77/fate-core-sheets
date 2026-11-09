import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportCharacterToPdf(elementId: string, characterName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Не удалось найти элемент для экспорта');
    return;
  }

  try {
    // Generate high resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0B0E14',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${characterName || 'Fate_Character'}_Sheet.pdf`);
  } catch (err) {
    console.error('PDF export failed', err);
    alert('Ошибка при генерации PDF');
  }
}
