import Dexie, { type Table } from 'dexie';
import { 
  type ShoppingList, 
  type ShoppingListItem, 
  type Group,
  type Note,
  type Poll,
  type Notification,
  type User,
  type ActivityLog,
  type Tag,
} from './types/models.ts';

export class MyDatabase extends Dexie {
  shoppingLists!: Table<ShoppingList>;
  shoppingListItems!: Table<ShoppingListItem>;
  groups!: Table<Group>;
  notes!: Table<Note>;
  polls!: Table<Poll>;
  notifications!: Table<Notification>;
  profile!: Table<User>;
  activityLogs!: Table<ActivityLog>;
  tags!: Table<Tag>;

  constructor() {
    super('docket'); 
    // Added more indexes
    this.version(9).stores({
      shoppingLists: '_id, authorId, groupId, isDirty',
      shoppingListItems: '_id, authorId, listId, productId, isChecked, isDirty',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId, isDirty',
      notes: '_id, groupId, authorId, isDirty',
      polls: '_id, groupId, authorId, isDirty',
      notifications: '_id, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
    });

    this.version(10).stores({
      shoppingLists: '_id, authorId, groupId, isDirty',
      shoppingListItems: '_id, authorId, listId, productId, isChecked, isDirty',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId, isDirty',
      notes: '_id, groupId, authorId, isDirty',
      polls: '_id, groupId, authorId, isDirty',
      notifications: '_id, createdAt, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, createdAt, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
    });
    this.version(11).stores({
      shoppingLists: '_id, authorId, groupId, isDirty, isPinned',
      shoppingListItems: '_id, authorId, listId, productId, isChecked, isDirty, isPinned',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId, isDirty',
      notes: '_id, groupId, authorId, isDirty',
      polls: '_id, groupId, authorId, isDirty',
      notifications: '_id, createdAt, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, createdAt, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
    });
    this.version(12).stores({
      shoppingLists: '_id, authorId, groupId, isDirty, isPinned',
      shoppingListItems: '_id, authorId, listId, productId, isChecked, isDirty, isPinned',
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