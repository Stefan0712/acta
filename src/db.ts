import Dexie, { type Table } from 'dexie';
import { 
  type ShoppingList, 
  type Product, 
  type ShoppingListItem, 
  type PurchasedItem, 
  type Category, 
  type Store, 
  type Recipe 
} from './types/models';

export class MyDatabase extends Dexie {
  shoppingLists!: Table<ShoppingList>;
  products!: Table<Product>;
  shoppingListItems!: Table<ShoppingListItem>;
  purchasedItems!: Table<PurchasedItem>;
  categories!: Table<Category>;
  stores!: Table<Store>;
  recipes!: Table<Recipe>;

  constructor() {
    super('docket'); 
    this.version(1).stores({
      shoppingLists: '_id, userId',
      products: '_id, userId, categoryId, *storeIds, *tags',
      shoppingListItems: '_id, listId, productId, isChecked',
      purchasedItems: '_id, userId, productId, storeId, purchasedAt',
      categories: '_id, name',
      stores: '_id, name',
      recipes: '_id, userId',
    });
  }
}
export const db = new MyDatabase();