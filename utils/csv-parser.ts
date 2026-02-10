import type { RouletteNumber } from '~/types';

export interface ParsedRouletteEntry {
  number: RouletteNumber;
  timestamp?: string;
  notes?: string;
}

export interface ParsedRouletteData {
  entries: ParsedRouletteEntry[];
  metadata?: {
    location?: string;
    table?: string;
    dateRange?: string;
  };
}

/**
 * Format: N;Z;R;- Uhrzeit (repeated 3 times per row)
 * N = Noir (Black), Z = Zero (Green), R = Rouge (Red)
 */
export function parseSpielbank(csvContent: string): ParsedRouletteData {
  const lines = csvContent.split('\n');
  const entries: ParsedRouletteEntry[] = [];
  const metadata: ParsedRouletteData['metadata'] = {};

  // Extract metadata from header
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.includes('Spielbank')) {
      metadata.location = line.split(';')[0].trim();
    }
    if (line.includes('Tisch:')) {
      const match = line.match(/Tisch:(.*?);/);
      if (match) metadata.table = match[1].trim();
    }
    if (line.includes('Datum:') && !metadata.dateRange) {
      const match = line.match(/Datum:\s*([\d\.]+ - [\d\.]+)/);
      if (match) metadata.dateRange = match[1];
    }
  }

  // Parse data rows
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(';');

    // Skip header/footer/empty lines
    if (
      !line ||
      line.includes('Spielbank') ||
      line.includes('Datum:') ||
      line.includes('Gewinnzahlen') ||
      line.includes('Statistiken') ||
      line.includes('Telefon') ||
      line.includes('Seite') ||
      parts[0] === 'N' ||
      parts.length < 4
    ) {
      continue;
    }

    // Parse up to 3 number groups per line (N;Z;R;Uhrzeit repeats 3x)
    for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
      const offset = groupIndex * 4;
      if (offset + 3 >= parts.length) break;

      const n = parts[offset]?.trim();
      const z = parts[offset + 1]?.trim();
      const r = parts[offset + 2]?.trim();
      const time = parts[offset + 3]?.trim();

      // Skip if this is a pause marker or empty
      if (n === '-' || !time) continue;

      // Determine the number (only one of N, Z, R should have a value)
      let number: number | null = null;
      if (n && n !== '' && !isNaN(Number(n))) {
        number = Number(n);
      } else if (z && z !== '' && !isNaN(Number(z))) {
        number = Number(z);
      } else if (r && r !== '' && !isNaN(Number(r))) {
        number = Number(r);
      }

      // Add entry if we found a valid number
      if (number !== null && number >= 0 && number <= 36) {
        entries.push({
          number: number as RouletteNumber,
          timestamp: time,
        });
      }
    }
  }

  return { entries, metadata };
}

/**
 * Parse generic CSV format
 * Format: number,timestamp,session,location,table,notes (header row required)
 * Also supports simplified format: number,timestamp,notes
 */
export function parseGenericCSV(csvContent: string): ParsedRouletteData {
  const lines = csvContent.split('\n');
  const entries: ParsedRouletteEntry[] = [];
  const metadata: ParsedRouletteData['metadata'] = {};

  if (lines.length === 0) return { entries };

  // Parse header to determine format
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const hasExtendedFormat = header.includes('session') || header.includes('location');

  // Extract metadata from first data row if extended format
  if (hasExtendedFormat && lines.length > 1) {
    const firstDataLine = lines[1].split(',');
    if (header.includes('location')) {
      const locationIdx = header.indexOf('location');
      metadata.location = firstDataLine[locationIdx]?.trim();
    }
    if (header.includes('table')) {
      const tableIdx = header.indexOf('table');
      metadata.table = firstDataLine[tableIdx]?.trim();
    }
  }

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    const number = parseInt(parts[0]?.trim() || '', 10);

    if (!isNaN(number) && number >= 0 && number <= 36) {
      const entry: ParsedRouletteEntry = {
        number: number as RouletteNumber,
        timestamp: parts[1]?.trim(),
      };

      // Add notes (last column)
      const notesIdx = hasExtendedFormat ? 5 : 2;
      if (parts[notesIdx]) {
        entry.notes = parts[notesIdx].trim();
      }

      entries.push(entry);
    }
  }

  return { entries, metadata };
}

/**
 * Auto-detect format and parse
 */
export function parseRouletteCSV(csvContent: string): ParsedRouletteData {
  // Check header line to determine format
  const firstLine = csvContent.split('\n')[0].toLowerCase();

  // If header contains 'number,timestamp' it's the generic format
  if (firstLine.includes('number,') || firstLine.includes('number;')) {
    return parseGenericCSV(csvContent);
  }

  // Check if it's Spielbank format (contains N;Z;R pattern in header)
  if (csvContent.includes('N;Z;R')) {
    return parseSpielbank(csvContent);
  }

  // Default to generic format
  return parseGenericCSV(csvContent);
}

/**
 * Generate a template CSV file content
 */
export function generateTemplateCSV(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  return `number,timestamp,session,location,table,notes
0,${dateStr} ${timeStr},Session 1,My Casino,Table 1,First spin
17,${dateStr} ${timeStr},Session 1,My Casino,Table 1,
32,${dateStr} ${timeStr},Session 1,My Casino,Table 1,
15,${dateStr} ${timeStr},Session 1,My Casino,Table 1,
4,${dateStr} ${timeStr},Session 1,My Casino,Table 1,Hot number
21,${dateStr} ${timeStr},Session 1,My Casino,Table 1,
`;
}

/**
 * Convert current history to CSV for export
 */
export function exportHistoryToCSV(
  history: RouletteNumber[],
  metadata?: { session?: string; location?: string; table?: string }
): string {
  const session = metadata?.session || 'Session 1';
  const location = metadata?.location || '';
  const table = metadata?.table || '';

  let csv = 'number,timestamp,session,location,table,notes\n';

  const now = new Date();
  history.forEach((num, index) => {
    const timestamp = new Date(now.getTime() + index * 60000).toISOString().replace('T', ' ').substring(0, 19);
    csv += `${num},${timestamp},${session},${location},${table},\n`;
  });

  return csv;
}
