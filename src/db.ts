import Dexie, { type Table } from 'dexie';
import { 
  type ShoppingList, 
  type Product, 
  type ShoppingListItem, 
  type PurchasedItem, 
  type Category, 
  type Store, 
  type Group,
  type Note,
  type Poll,
  type Notification,
  type User,
  type ActivityLog
} from './types/models';

export class MyDatabase extends Dexie {
  shoppingLists!: Table<ShoppingList>;
  products!: Table<Product>;
  shoppingListItems!: Table<ShoppingListItem>;
  purchasedItems!: Table<PurchasedItem>;
  categories!: Table<Category>;
  stores!: Table<Store>;
  groups!: Table<Group>;
  notes!: Table<Note>;
  polls!: Table<Poll>;
  notifications!: Table<Notification>;
  profile!: Table<User>;
  activityLogs!: Table<ActivityLog>;

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
  }
}
export const db = new MyDatabase();