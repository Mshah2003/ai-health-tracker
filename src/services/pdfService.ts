import jsPDF from 'jspdf';
import { ChatSession } from '../types';
import { format } from 'date-fns';

export const generatePDFReport = async (session: ChatSession, reportContent: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let currentY = margin;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Health Symptom Report', margin, currentY);
  currentY += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Condition: ${session.condition || 'General Health'}`, margin, currentY);
  currentY += 8;
  pdf.text(`Generated: ${format(new Date(), 'PPP')}`, margin, currentY);
  currentY += 8;
  
  if (session.userProfile?.age || session.userProfile?.gender) {
    pdf.text(`Profile: Age ${session.userProfile.age || 'N/A'}, Gender: ${session.userProfile.gender || 'N/A'}`, margin, currentY);
    currentY += 15;
  } else {
    currentY += 8;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Generated Summary', margin, currentY);
  currentY += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const lines = pdf.splitTextToSize(reportContent, pageWidth - 2 * margin);
  
  for (const line of lines) {
    if (currentY > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    pdf.text(line, margin, currentY);
    currentY += 5;
  }

  const fileName = `symptom-report-${format(new Date(), 'yyyy-MM-dd')}-${session.condition || 'general'}.pdf`;
  pdf.save(fileName);
};