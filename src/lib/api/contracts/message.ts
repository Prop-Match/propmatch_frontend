export type MatchConversationSummary = { matchConnectionId: string; propertyId: string; propertyTitle: string; propertyCoverImage: string | null; otherParticipantName: string; connectionStatus: 'CONNECTED'; lastMessagePreview: string | null; lastMessageAt: string | null };
export type MatchMessage = { id: string; senderId: string; body: string; createdAt: string; isMine: boolean };
export type SendMatchMessageInput = { body: string };

export type RealtimeMatchMessage = MatchMessage & { matchConnectionId: string };
