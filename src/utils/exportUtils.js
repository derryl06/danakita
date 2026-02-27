import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (targets, transactions) => {
    const workbook = new ExcelJS.Workbook();
    const primaryColor = '4F46E5'; // Indigo-600
    const lightGray = 'F3F4F6';

    // --- SHEET 1: RINGKASAN & TARGET ---
    const sheet = workbook.addWorksheet('Ringkasan & Target');

    // Judul Besar
    sheet.mergeCells('A1:E2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'LAPORAN PROGRESS DANA KITA';
    titleCell.font = { name: 'Arial Black', size: 16, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Metadata
    sheet.getCell('A4').value = 'Tanggal Cetak:';
    sheet.getCell('B4').value = new Date().toLocaleString('id-ID');
    sheet.getCell('A4').font = { bold: true };

    // Summary Box
    const totalTarget = targets.reduce((acc, t) => acc + t.target_amount, 0);
    const totalCurrent = targets.reduce((acc, t) => acc + t.current_amount, 0);
    const progress = totalTarget > 0 ? (totalCurrent / totalTarget * 100).toFixed(1) : 0;

    sheet.getCell('A6').value = 'TOTAL SALDO';
    sheet.getCell('B6').value = totalCurrent;
    sheet.getCell('B6').numFmt = '"Rp" #,##0';
    sheet.getCell('A6').font = { bold: true };

    sheet.getCell('A7').value = 'TOTAL TARGET';
    sheet.getCell('B7').value = totalTarget;
    sheet.getCell('B7').numFmt = '"Rp" #,##0';
    sheet.getCell('A7').font = { bold: true };

    sheet.getCell('A8').value = 'PROGRESS TOTAL';
    sheet.getCell('B8').value = progress + '%';
    sheet.getCell('A8').font = { bold: true };

    // Header Tabel Target
    const targetHeaderRow = sheet.getRow(11);
    targetHeaderRow.values = ['NAMA TARGET', 'KATEGORI', 'TERKUMPUL', 'TARGET', 'PROGRESS'];
    targetHeaderRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    targetHeaderRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6366F1' } };
        cell.border = { bottom: { style: 'thin' } };
    });

    // Isi Data Target
    targets.forEach((t, index) => {
        const row = sheet.addRow([
            t.name,
            t.category,
            t.current_amount,
            t.target_amount,
            ((t.current_amount / t.target_amount) * 100).toFixed(1) + '%'
        ]);

        // Formatting angka
        row.getCell(3).numFmt = '"Rp" #,##0';
        row.getCell(4).numFmt = '"Rp" #,##0';
        row.getCell(5).alignment = { horizontal: 'center' };

        // Alternate row color
        if (index % 2 === 0) {
            row.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
            });
        }
    });

    // Auto-width columns
    sheet.columns.forEach(column => {
        column.width = 20;
    });

    // --- SHEET 2: RIWAYAT TRANSAKSI ---
    const txSheet = workbook.addWorksheet('Riwayat Transaksi');

    // Header Transaksi
    const txHeader = txSheet.getRow(1);
    txHeader.values = ['TANGGAL', 'TARGET', 'TIPE', 'NOMINAL', 'CATATAN'];
    txHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    txHeader.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
    });

    transactions.forEach((tx, index) => {
        const target = targets.find(t => t.id === tx.targetId);
        const row = txSheet.addRow([
            new Date(tx.date).toLocaleDateString('id-ID'),
            target ? target.name : '-',
            tx.type === 'in' ? 'MASUK' : 'KELUAR',
            tx.amount,
            tx.note || '-'
        ]);

        row.getCell(4).numFmt = '"Rp" #,##0';
        if (index % 2 === 0) {
            row.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
            });
        }
    });

    txSheet.columns.forEach(column => {
        column.width = 20;
    });

    // Write file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan_DanaKita_${new Date().getTime()}.xlsx`);
};

export const exportToPDF = (targets, transactions) => {
    const doc = new jsPDF();
    const primaryColor = [79, 70, 229]; // Indigo-600

    // Header Cantik
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DANA KITA', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Keuangan & Progress Tabungan', 20, 32);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    const dateStr = new Date().toLocaleString('id-ID');
    doc.text(`Dicetak pada: ${dateStr}`, 140, 25);

    // Ringkasan Section
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN PERFORMA', 20, 55);

    const totalTarget = targets.reduce((acc, t) => acc + t.target_amount, 0);
    const totalCurrent = targets.reduce((acc, t) => acc + t.current_amount, 0);
    const progressPercent = totalTarget > 0 ? (totalCurrent / totalTarget * 100).toFixed(1) : 0;

    autoTable(doc, {
        startY: 60,
        theme: 'plain',
        body: [
            ['Total Dana Terkumpul', `:`, `Rp ${totalCurrent.toLocaleString('id-ID')}`],
            ['Akumulasi Target', `:`, `Rp ${totalTarget.toLocaleString('id-ID')}`],
            ['Progress Keseluruhan', `:`, `${progressPercent}%`],
        ],
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 }, 1: { width: 5 } }
    });

    // Tabel Target
    doc.setFontSize(12);
    doc.text('RINCIAN TARGET TABUNGAN', 20, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Nama Target', 'Kategori', 'Terkumpul', 'Target', 'Progress']],
        body: targets.map(t => [
            t.name,
            t.category,
            `Rp ${t.current_amount.toLocaleString('id-ID')}`,
            `Rp ${t.target_amount.toLocaleString('id-ID')}`,
            `${((t.current_amount / t.target_amount) * 100).toFixed(1)}%`
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    // Tabel Transaksi
    if (transactions.length > 0) {
        doc.addPage();
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('RIWAYAT TRANSAKSI TERBARU', 20, 13);

        autoTable(doc, {
            startY: 30,
            head: [['Tanggal', 'Target', 'Tipe', 'Nominal', 'Catatan']],
            body: transactions.slice(0, 50).map(tx => {
                const target = targets.find(t => t.id === tx.targetId);
                return [
                    new Date(tx.date).toLocaleDateString('id-ID'),
                    target ? target.name : '-',
                    tx.type === 'in' ? 'MASUK' : 'KELUAR',
                    `Rp ${tx.amount.toLocaleString('id-ID')}`,
                    tx.note || '-'
                ];
            }),
            headStyles: { fillColor: [100, 116, 139], textColor: 255 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                2: { fontStyle: 'bold' },
                3: { halign: 'right' }
            }
        });
    }

    // Footer at end of doc
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount} - Dana Kita App`, 105, 285, { align: 'center' });
    }

    doc.save(`Laporan_DanaKita_${new Date().toLocaleDateString()}.pdf`);
};
