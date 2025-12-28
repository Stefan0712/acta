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
} from './types/models.ts';

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
  }
}
export const db = new MyDatabase();