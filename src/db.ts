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
  type Poll
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

  constructor() {
    super('docket'); 
    this.version(3).stores({
      shoppingLists: '_id, userId',
      products: '_id, userId, categoryId, *storeIds, *tags',
      shoppingListItems: '_id, listId, productId, isChecked',
      purchasedItems: '_id, userId, productId, storeId, purchasedAt',
      categories: '_id, name',
      stores: '_id, name',
      groups:'_id, authorId, *members.userId',
      notes: '_id, groupId',
      polls: '_id, groupId'
    });
  }
}
export const db = new MyDatabase();