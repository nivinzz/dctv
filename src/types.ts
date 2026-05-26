export interface FileRecord {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  senderId: string;
}

export interface RoomSyncData {
  files: FileRecord[];
  userCount: number;
}

export interface UserHistoryItem {
  roomId: string;
  joinedAt: number;
}
