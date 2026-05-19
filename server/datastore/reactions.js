import { getAddress } from 'viem';
import datastore from '../utils/datastore.js';

const KIND = 'MessageReactions';
export const REACTION_EMOJI = '❤️';

export function reactionKey(messageId, reactionAuthor) {
  return `${messageId}:${getAddress(reactionAuthor)}`;
}

function entityToReaction(entity) {
  const key = entity[datastore.KEY].name;
  return {
    key,
    messageId: entity.messageId,
    reactionAuthor: entity.reactionAuthor,
    timestamp: entity.timestamp,
    emoji: entity.emoji,
  };
}

export async function saveReaction({
  messageId,
  reactionAuthor,
  timestamp,
  emoji = REACTION_EMOJI,
}) {
  const author = getAddress(reactionAuthor);
  const keyName = reactionKey(messageId, author);
  const ts = Math.floor(timestamp);

  await datastore.save({
    key: datastore.key([KIND, keyName]),
    data: {
      messageId,
      reactionAuthor: author,
      timestamp: ts,
      emoji,
    },
  });

  return {
    key: keyName,
    messageId,
    reactionAuthor: author,
    timestamp: ts,
    emoji,
  };
}

export async function getReaction(messageId, reactionAuthor) {
  const keyName = reactionKey(messageId, reactionAuthor);
  const [entity] = await datastore.get(datastore.key([KIND, keyName]));
  if (!entity) return null;
  return entityToReaction(entity);
}

export async function listReactionsForMessages(messageIds, viewerAddress) {
  if (!messageIds.length) return new Map();

  const uniqueIds = [...new Set(messageIds)];
  const query = datastore
    .createQuery(KIND)
    .filter('messageId', 'IN', uniqueIds);

  const [entities] = await datastore.runQuery(query);
  const reactions = entities.map(entityToReaction);

  let viewer = null;
  if (viewerAddress) {
    try {
      viewer = getAddress(viewerAddress);
    } catch {
      viewer = null;
    }
  }

  const summary = new Map();
  for (const id of uniqueIds) {
    summary.set(id, { count: 0, reactedByMe: false, emoji: REACTION_EMOJI });
  }

  for (const reaction of reactions) {
    const entry = summary.get(reaction.messageId);
    if (!entry) continue;
    entry.count += 1;
    if (viewer && reaction.reactionAuthor === viewer) {
      entry.reactedByMe = true;
    }
  }

  return summary;
}
