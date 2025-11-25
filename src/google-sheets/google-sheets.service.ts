import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { ConfigService } from '@nestjs/config';

interface FindRowsResult {
  rowIndex: number; // 0-based row number
  rowNumber: number; // 1-based row number
  values: any[]; // full row values
}

@Injectable()
export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(private readonly config: ConfigService) {
    const keyFile = config.get(
      'GOOGLE_SERVICE_ACCOUNT_JSON_LOCATION',
      '.hi-fella-google.json',
    );
    this.spreadsheetId = config.get<string>('GOOGLE_SHEET_USER', '');

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async getHeaders({
    spreadsheetId = this.spreadsheetId,
    sheetName,
  }: {
    spreadsheetId?: string;
    sheetName: string;
  }): Promise<string[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`, // row 1 only
    });

    const headers = res.data.values ? res.data.values[0] : [];
    return headers;
  }

  /**
   * Get the numeric sheetId for a given sheet name
   * @param sheetName The name of the sheet/tab
   */
  async getSheetId(sheetName: string): Promise<number> {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const sheet = res.data.sheets?.find(
      (s) => s.properties?.title === sheetName,
    );

    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    return sheet.properties?.sheetId!;
  }

  async findRowsByColumns({
    spreadsheetId = this.spreadsheetId,
    sheetName = 'User',
    columnFilters,
  }: {
    spreadsheetId?: string;
    sheetName?: string;
    columnFilters: Record<string, string>;
  }) {
    // 1️⃣ Get headers
    const headers = await this.getHeaders({ spreadsheetId, sheetName });

    // 2️⃣ Map column names to indexes
    const filterIndexes: Record<number, string | number> = {};
    for (const [colName, val] of Object.entries(columnFilters)) {
      const idx = headers.indexOf(colName);
      if (idx === -1) throw new Error(`Column "${colName}" not found`);
      filterIndexes[idx] = val;
    }

    // 3️⃣ Get all rows
    const lastHeaderLetter = numberToColumnLetter(headers.length);
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:${lastHeaderLetter}`, // adjust max column if needed
    });

    const allValues: any[][] = res.data.values || [];

    // 4️⃣ Filter rows
    const results: FindRowsResult[] = [];

    allValues.forEach((row, i) => {
      const isMatch = Object.entries(filterIndexes).every(
        ([colIdx, val]) => row[+colIdx] === val,
      );

      if (isMatch) {
        results.push({
          rowIndex: i + 1, // 0-based row number
          rowNumber: i + 2, // 1-based row number
          values: row,
        });
      }
    });

    return results;
  }

  async read({
    spreadsheetId = this.spreadsheetId,
    range,
  }: {
    spreadsheetId?: string;
    range: string;
  }) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values ?? [];
  }

  async write({
    spreadsheetId = this.spreadsheetId,
    range,
    values,
  }: {
    spreadsheetId?: string;
    range: string;
    values: any[][];
  }) {
    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return response.data;
  }

  async append({
    spreadsheetId = this.spreadsheetId,
    sheetName = 'User',
    values,
  }: {
    spreadsheetId?: string;
    sheetName?: string;
    values: any[]; // A single row
  }) {
    const headerLength = (await this.getHeaders({ sheetName: sheetName }))
      .length;
    const lastHeaderLetter = numberToColumnLetter(headerLength);
    const range = `${sheetName}!A:${lastHeaderLetter}`; // target sheet

    const res = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [values], // must be array of arrays
      },
    });

    return res.data;
  }

  async appendRaw({
    spreadsheetId = this.spreadsheetId,
    range,
    values,
  }: {
    spreadsheetId?: string;
    range: string;
    values: any[][];
  }) {
    return this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
  }

  async clear({
    spreadsheetId = this.spreadsheetId,
    sheetName,
    range = undefined,
  }: {
    spreadsheetId?: string;
    sheetName: string;
    range?: string;
  }) {
    const headerLength = (await this.getHeaders({ sheetName: sheetName }))
      .length;
    const lastHeaderLetter = numberToColumnLetter(headerLength);
    const rangeClear = `${sheetName}!${range ? range : `A2:${lastHeaderLetter}`}`;

    return this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: rangeClear,
      requestBody: {},
    });
  }

  async batchUpdate({
    spreadsheetId = this.spreadsheetId,
    requests,
  }: {
    spreadsheetId?: string;
    requests: any[];
  }) {
    return this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }

  async batchUpdateValues({
    spreadsheetId = this.spreadsheetId,
    requests,
  }: {
    spreadsheetId?: string;
    requests: {
      valueInputOption: 'RAW' | 'USER_ENTERED';
      data: { range: string; values: any[][] }[];
    };
  }) {
    return this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: requests,
    });
  }
}
