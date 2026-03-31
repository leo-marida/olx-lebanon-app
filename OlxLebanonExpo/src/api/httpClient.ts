const BASE_URL_SEARCH = 'https://search.mena.sector.run';
const BASE_URL_OLX = 'https://www.olx.com.lb/api';

export const msearchRequest = async (body: string): Promise<any> => {
  const response = await fetch(`${BASE_URL_SEARCH}/_msearch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-ndjson',
    },
    body,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const olxApiRequest = async (path: string): Promise<any> => {
  const response = await fetch(`${BASE_URL_OLX}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};