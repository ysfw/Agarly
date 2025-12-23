export interface sseEvent {
  type: string;
  to: string[]; // Array of recipient emails
  data?: number | object | null; // Optional payload (item ID or other data)
}

// Event type constants
export const SSE_EVENT_TYPES = {
  ITEM_CREATED: 'ITEM_CREATED',
  ITEM_APPROVED: 'ITEM_APPROVED',
  ITEM_REJECTED: 'ITEM_REJECTED',
  BANNED: 'Banned',
} as const;

