export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  channels: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  teamId: string;
  type: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  channelId: string;
  type: 'text' | 'file' | 'system';
  attachments?: Attachment[];
  reactions?: Reaction[];
  edited?: boolean;
  replyTo?: Message;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // User IDs
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  attendees: User[];
  organizer: User;
  status: 'scheduled' | 'cancelled' | 'completed';
  recurrence?: RecurrenceRule;
  color?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: Date;
  count?: number;
  weekDays?: number[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  sharedWith: User[];
  version: number;
  versions: DocumentVersion[];
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  createdBy: User;
  createdAt: Date;
  version: number;
  changes: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: User;
  creator: User;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
}