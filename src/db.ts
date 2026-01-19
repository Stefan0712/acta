import Dexie, { type Table } from 'dexie';
import { 
  type List, 
  type ListItem, 
  type Group,
  type Note,
  type Poll,
  type Notification,
  type User,
  type ActivityLog,
  type Tag,
  type NoteComment,
} from './types/models.ts';

export interface SyncAction {
  id?: number;          // Auto-increment local ID
  type: 'CREATE_GROUP' | 'CREATE_LIST' | 'CREATE_ITEM' | 'CREATE_POLL' | "CREATE_NOTE" | 'CHECK_ITEM' | 'VOTE_POLL' | 'CREATE_COMMENT';
  payload: any;         // The data needed for the API call 
  tempId?: string;      // The UUID we generated locally that we use later for swapping
  createdAt: number;
  status: 'pending' | 'processing' | 'failed' | 'completed'; // To prevent double-sending
  retryCount: number;
}



export class MyDatabase extends Dexie {
  lists!: Table<List>;
  listItems!: Table<ListItem>;
  groups!: Table<Group>;
  notes!: Table<Note>;
  polls!: Table<Poll>;
  notifications!: Table<Notification>;
  profile!: Table<User>;
  activityLogs!: Table<ActivityLog>;
  tags!: Table<Tag>;
  syncQueue!: Table<SyncAction>;
  noteComments!: Table<NoteComment>;

  constructor() {
    super('docket'); 

    this.version(13).stores({
      lists: '_id, authorId, groupId, isDirty, isPinned',
      listItems: '_id, authorId, listId, isChecked, isDirty, isPinned',
      groups:'_id, authorId, *members.userId, isDirty',
      notes: '_id, groupId, authorId, isDirty',
      polls: '_id, groupId, authorId, isDirty',
      notifications: '_id, createdAt, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, createdAt, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
      tags: '_id, name'
    });

    // Added the syncQueue
    this.version(14).stores({
      lists: '_id, authorId, groupId, isDirty, isPinned',
      listItems: '_id, authorId, listId, isChecked, isDirty, isPinned',
      groups:'_id, authorId, *members.userId, isDirty',
      notes: '_id, groupId, authorId, isDirty',
      polls: '_id, groupId, authorId, isDirty',
      notifications: '_id, createdAt, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, createdAt, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
      tags: '_id, name',
      syncQueue: '++id, status, type, createdAt'
    });
    // Added note comments
    this.version(15).stores({
      lists: '_id, authorId, groupId, isDirty, isPinned',
      listItems: '_id, authorId, listId, isChecked, isDirty, isPinned',
      groups:'_id, authorId, *members.userId, isDirty',
      notes: '_id, groupId, authorId, isDirty',
      noteComments: '_id, groupId, noteId, authorId',
      polls: '_id, groupId, authorId, isDirty',
      notifications: '_id, createdAt, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, createdAt, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
      tags: '_id, name',
      syncQueue: '++id, status, type, createdAt'
    });
    // Added "syncStatus"
    this.version(16).stores({
      lists: '_id, authorId, groupId, isDirty, isPinned, syncStatus',
      listItems: '_id, authorId, listId, isChecked, isDirty, isPinned, syncStatus',
      groups:'_id, authorId, *members.userId, isDirty, syncStatus',
      notes: '_id, groupId, authorId, isDirty, syncStatus',
      noteComments: '_id, groupId, noteId, authorId, syncStatus',
      polls: '_id, groupId, authorId, isDirty, syncStatus',
      notifications: '_id, createdAt, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, createdAt, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
      tags: '_id, name',
      syncQueue: '++id, status, type, createdAt'
    });

  }
}
export const db = new MyDatabase();