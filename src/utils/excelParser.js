import * as XLSX from 'xlsx';

export async function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', raw: false });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
        });

        if (!rawData || rawData.length === 0) {
          reject(new Error('시트가 비어 있습니다.'));
          return;
        }

        // Find first non-empty row as header
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(5, rawData.length); i++) {
          if (rawData[i].some((cell) => cell !== '')) {
            headerRowIdx = i;
            break;
          }
        }

        const rawHeaders = rawData[headerRowIdx];
        const headers = rawHeaders.map((h, i) =>
          h !== '' && h !== null && h !== undefined ? String(h).trim() : `Column_${i + 1}`
        );

        const uniqueHeaders = [];
        const seenHeaders = {};
        headers.forEach((h) => {
          if (seenHeaders[h] !== undefined) {
            seenHeaders[h]++;
            uniqueHeaders.push(`${h}_${seenHeaders[h]}`);
          } else {
            seenHeaders[h] = 0;
            uniqueHeaders.push(h);
          }
        });

        const dataRows = rawData.slice(headerRowIdx + 1).filter((row) =>
          row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
        );

        const records = dataRows.map((row) => {
          const record = {};
          uniqueHeaders.forEach((header, i) => {
            const cell = row[i];
            record[header] = cell !== undefined && cell !== null ? cell : '';
          });
          return record;
        });

        resolve({
          headers: uniqueHeaders,
          records,
          sheetName: firstSheetName,
          totalSheets: workbook.SheetNames.length,
          allSheets: workbook.SheetNames,
        });
      } catch (err) {
        reject(new Error(`파일 파싱 오류: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}
