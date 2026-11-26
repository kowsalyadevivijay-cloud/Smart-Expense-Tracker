import { getSmartEmoji } from '../constants';

export function withIdentity(entry) {
  return {
    ...entry,
    emoji: entry.emoji || getSmartEmoji(entry.category, entry.note),
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
}
