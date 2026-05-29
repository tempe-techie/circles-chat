import { circlesConfig } from '@aboutcircles/sdk-core';
import { getAddress } from 'viem';

const config = circlesConfig[100];
const rpcUrl = config.circlesRpcUrl.replace(/\/$/, '');

export const IGNORED_GROUP_ADDRESSES = new Set([
  // Important: must be lowercase!
  '0x7cadb2e92295f3e4fa65d3d4e7265e2e05d7a783',
  '0xeb44aff8ec210df433803a97714d527055cc0099',
  '0x24c9ba1fb88533b0cd2aea37dad75b809eecf2c0',
  '0xb629a1e86f3efada0f87c83494da8cc34c3f84ef',
  '0x93ed5a96347927ff6ff6b790f8cf5258240c321f'
]);

export type UserGroup = {
  address: string;
  name: string;
  symbol: string | null;
  channelName: string;
};

type QueryResult = {
  columns: string[];
  rows: unknown[][];
};

async function circlesQuery(params: Record<string, unknown>): Promise<QueryResult> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'circles_query',
      params: [params],
    }),
  });

  const data = (await res.json()) as {
    result?: QueryResult;
    error?: { message?: string };
  };

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? 'Circles query failed');
  }

  return data.result ?? { columns: [], rows: [] };
}

function rowToRecord(columns: string[], row: unknown[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (let i = 0; i < columns.length; i++) {
    record[columns[i]] = row[i];
  }
  return record;
}

export function groupNameToChannel(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `#${slug || 'group'}`;
}

export async function fetchUserGroups(address: string): Promise<UserGroup[]> {
  const memberLower = getAddress(address).toLowerCase();

  const memberships = await circlesQuery({
    Namespace: 'V_CrcV2',
    Table: 'GroupMemberships',
    Columns: ['group', 'member'],
    Filter: [
      {
        Type: 'FilterPredicate',
        FilterType: 'Equals',
        Column: 'member',
        Value: memberLower,
      },
    ],
    Limit: 100,
  });

  const groupAddresses = new Set<string>();
  for (const row of memberships.rows) {
    const record = rowToRecord(memberships.columns, row);
    const group = String(record.group ?? '').toLowerCase();
    if (!group || IGNORED_GROUP_ADDRESSES.has(group)) continue;
    groupAddresses.add(group);
  }

  const groups: UserGroup[] = [];

  for (const groupLower of groupAddresses) {
    const result = await circlesQuery({
      Namespace: 'V_CrcV2',
      Table: 'Groups',
      Columns: ['group', 'name', 'symbol', 'memberCount'],
      Filter: [
        {
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'group',
          Value: groupLower,
        },
      ],
      Limit: 1,
    });

    if (result.rows.length === 0) continue;

    const record = rowToRecord(result.columns, result.rows[0]);
    const name = String(record.name ?? 'Group');
    const address = getAddress(String(record.group ?? groupLower));

    groups.push({
      address,
      name,
      symbol: record.symbol != null ? String(record.symbol) : null,
      channelName: groupNameToChannel(name),
    });
  }

  groups.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}
