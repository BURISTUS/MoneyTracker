import * as Sharing from 'expo-sharing';
import { cacheDirectory, documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { EncodingType } from 'expo-file-system/legacy';
import { api } from './api';
import i18n from '../i18n';
import { showGlobalSuccess } from '../components/ui/Toast';

const BASE = '/export';

function getExt(format: string): string {
  if (format === 'xlsx') return 'xlsx';
  if (format === 'json') return 'json';
  return 'csv';
}

function getMime(format: string): string {
  if (format === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (format === 'json') return 'application/json';
  return 'text/csv';
}

const cacheDir = cacheDirectory || documentDirectory || '';

export const exportService = {
  async exportTransactions(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    startDate?: string,
    endDate?: string,
  ): Promise<void> {
    const params = new URLSearchParams({ format });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = await getToken();
    const url = `${api.defaults.baseURL}${BASE}/transactions?${params.toString()}`;

    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || i18n.t('exportSection.exportError'));
    }

    await saveAndShare(response, format, 'transactions');
  },

  async exportAnalytics(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const params = new URLSearchParams({ format, startDate, endDate });

    const token = await getToken();
    const url = `${api.defaults.baseURL}${BASE}/analytics?${params.toString()}`;

    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || i18n.t('exportSection.exportError'));
    }

    await saveAndShare(response, format, 'analytics');
  },
};

async function getToken(): Promise<string> {
  const SecureStore = require('expo-secure-store');
  return SecureStore.getItemAsync('token');
}

async function saveAndShare(response: Response, format: string, name: string): Promise<void> {
  const ext = getExt(format);
  const mime = getMime(format);
  const filePath = `${cacheDir}${name}.${ext}`;

  if (format === 'json') {
    const data = await response.json();
    await writeAsStringAsync(filePath, JSON.stringify(data, null, 2), { encoding: EncodingType.UTF8 });
  } else if (format === 'csv') {
    const text = await response.text();
    await writeAsStringAsync(filePath, text, { encoding: EncodingType.UTF8 });
  } else {
    const blob = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(blob);
    await writeAsStringAsync(filePath, base64, { encoding: EncodingType.Base64 });
  }

  if (!(await Sharing.isAvailableAsync())) {
    showGlobalSuccess(i18n.t('exportSection.exportSaved', { path: filePath }));
    return;
  }

  await Sharing.shareAsync(filePath, {
    mimeType: mime,
    dialogTitle: i18n.t('exportSection.exportName', { name }),
    UTI: format === 'xlsx' ? 'com.microsoft.excel.xlsx' : format === 'json' ? 'public.json' : 'public.comma-separated-values-text',
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}