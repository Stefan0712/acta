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

    this.version(3).stores({
      shoppingLists: '_id, userId, groupId',
      products: '_id, userId, categoryId, *storeIds, *tags',
      shoppingListItems: '_id, listId, productId, isChecked',
      purchasedItems: '_id, userId, productId, storeId, purchasedAt',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId',
      notes: '_id, groupId',
      polls: '_id, groupId',
    });
    // Added notifications and categories
    this.version(4).stores({
      shoppingLists: '_id, userId, groupId',
      products: '_id, userId, categoryId, *storeIds, *tags',
      shoppingListItems: '_id, listId, productId, isChecked',
      purchasedItems: '_id, userId, productId, storeId, purchasedAt',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId',
      notes: '_id, groupId',
      polls: '_id, groupId',
      notifications: '_id, recipientId, isRead, groupId, [groupId+category]',
    });
    // Added a new profile table for user data backup
    this.version(5).stores({
      shoppingLists: '_id, userId, groupId',
      products: '_id, userId, categoryId, *storeIds, *tags',
      shoppingListItems: '_id, listId, productId, isChecked',
      purchasedItems: '_id, userId, productId, storeId, purchasedAt',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId',
      notes: '_id, groupId',
      polls: '_id, groupId',
      notifications: '_id, recipientId, isRead, groupId, [groupId+category]',
      profile: '_id',
    });
    // Separated notifications into notifications and activity logs
    this.version(6).stores({
      shoppingLists: '_id, userId, groupId',
      products: '_id, userId, categoryId, *storeIds, *tags',
      shoppingListItems: '_id, listId, productId, isChecked',
      purchasedItems: '_id, userId, productId, storeId, purchasedAt',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId',
      notes: '_id, groupId',
      polls: '_id, groupId',
      notifications: '_id, recipientId, isRead, groupId, [groupId+category]',
      activityLogs: '_id, recipientId, groupId, [groupId+category], [groupId+createdAt]',
      profile: '_id',
    });
  }
}
export const db = new MyDatabase();