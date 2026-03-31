const BASE_URL_SEARCH = 'https://search.mena.sector.run';
const BASE_URL_OLX = 'https://www.olx.com.lb/api';

export const msearchRequest = async (body: string): Promise<any> => {
  const response = await fetch(`${BASE_URL_SEARCH}/_msearch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Accept': 'application/json',
      'Origin': 'https://www.olx.com.lb',
      'Referer': 'https://www.olx.com.lb/',
      'x-requested-with': 'XMLHttpRequest',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
};

export const olxApiRequest = async (path: string): Promise<any> => {
  const response = await fetch(`${BASE_URL_OLX}${path}`, {
    headers: {
      'Accept': 'application/json',
      'Origin': 'https://www.olx.com.lb',
      'Referer': 'https://www.olx.com.lb/',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
};