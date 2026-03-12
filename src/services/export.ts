import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Group, Expense } from '../types';

export const exportToExcel = (group: Group, expenses: Expense[], targetPerson?: string) => {
  const participantList = group.participants.split(',').map(p => p.trim()).filter(p => p);
  const totalPeople = participantList.length + 1;

  const data = expenses.map(e => ({
    'Description': e.description,
    'Payer': e.payer || 'Me',
    'Total Amount ($)': e.amount.toFixed(2),
    'Your Share ($)': (e.amount / totalPeople).toFixed(2),
    'Date': new Date(e.date).toLocaleDateString()
  }));

  const totalGroup = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIndividual = totalGroup / totalPeople;

  if (targetPerson) {
    // For individual export, we focus on their share
    const individualData = expenses.map(e => ({
      'Description': e.description,
      'Payer': e.payer || 'Me',
      'Individual Share ($)': (e.amount / totalPeople).toFixed(2),
      'Date': new Date(e.date).toLocaleDateString()
    }));
    
    individualData.push({
      'Description': 'TOTAL YOU OWE',
      'Payer': '',
      'Individual Share ($)': totalIndividual.toFixed(2),
      'Date': ''
    });

    const ws = XLSX.utils.json_to_sheet(individualData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'My Share');
    XLSX.writeFile(wb, `${group.name}_${targetPerson}_Contribution.xlsx`.replace(/\s+/g, '_'));
  } else {
    // Full group report
    data.push({
      'Description': 'TOTAL GROUP SPENT',
      'Payer': '',
      'Total Amount ($)': totalGroup.toFixed(2),
      'Your Share ($)': totalIndividual.toFixed(2),
      'Date': ''
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Group Expenses');
    XLSX.writeFile(wb, `${group.name}_Summary.xlsx`.replace(/\s+/g, '_'));
  }
};

export const exportToPDF = (group: Group, expenses: Expense[], targetPerson?: string) => {
  const doc = new jsPDF();
  const totalGroup = expenses.reduce((sum, e) => sum + e.amount, 0);
  const participantList = group.participants.split(',').map(p => p.trim()).filter(p => p);
  const totalPeople = participantList.length + 1;
  const sharePerPerson = totalGroup / totalPeople;

  // Header
  doc.setFontSize(22);
  doc.text(targetPerson ? `${targetPerson}'s Contribution` : group.name, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Group: ${group.name} | Generated on ${new Date().toLocaleDateString()}`, 14, 28);

  // Summary Box
  doc.setDrawColor(230);
  doc.setFillColor(248, 248, 247);
  doc.rect(14, 35, 182, 30, 'F');
  
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(targetPerson ? 'Individual Summary' : 'Group Summary', 20, 45);
  
  doc.setFontSize(10);
  doc.text(`Total Group Spent: $${totalGroup.toFixed(2)}`, 20, 55);
  doc.text(`Split between: ${totalPeople} people`, 100, 55);
  
  if (targetPerson) {
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`${targetPerson} owes: $${sharePerPerson.toFixed(2)}`, 20, 60);
  } else {
    doc.text(`Each person owes: $${sharePerPerson.toFixed(2)}`, 20, 60);
  }

  // Table
  const tableData = expenses.map(e => [
    e.description,
    e.payer || 'Me',
    targetPerson ? `$${(e.amount / totalPeople).toFixed(2)}` : `$${e.amount.toFixed(2)}`,
    new Date(e.date).toLocaleDateString()
  ]);

  autoTable(doc, {
    startY: 75,
    head: [[
      'Description', 
      'Payer', 
      targetPerson ? 'Your Share' : 'Total Amount', 
      'Date'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 37, 36] }, // Stone-900
    foot: [[
      targetPerson ? 'TOTAL YOU OWE' : 'TOTAL GROUP SPENT', 
      '', 
      targetPerson ? `$${sharePerPerson.toFixed(2)}` : `$${totalGroup.toFixed(2)}`, 
      ''
    ]],
    footStyles: { fillColor: [245, 245, 244], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  const fileName = targetPerson 
    ? `${group.name}_${targetPerson}_Contribution.pdf`
    : `${group.name}_Summary.pdf`;

  doc.save(fileName.replace(/\s+/g, '_'));
};
