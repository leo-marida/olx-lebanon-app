import { msearchRequest } from './httpClient';
import { Location } from '../types/location';

export const fetchLocations = async (
  hierarchyExternalID = '1',
  level = 1,
): Promise<Location[]> => {
  const header = JSON.stringify({ index: 'olx-lb-production-locations-en' });
  const body = JSON.stringify({
    from: 0,
    size: 10000,
    track_total_hits: false,
    query: {
      bool: {
        must: [
          { term: { 'hierarchy.externalID': hierarchyExternalID } },
          { term: { level } },
        ],
      },
    },
    sort: [{ name: { order: 'asc' } }],
    timeout: '5s',
  });

  const data = await msearchRequest(`${header}\n${body}\n`);
  const hits = data.responses?.[0]?.hits?.hits || [];

  return hits.map((hit: any): Location => ({
    id: hit._id,
    externalID: hit._source.externalID || hit._id,
    name: hit._source.name || '',
    level: hit._source.level,
    parentExternalID: hit._source.hierarchy?.[0]?.externalID,
  }));
};