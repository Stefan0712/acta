export interface ShoppingList {
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt?: Date;
    userId: string;
    color: string;
    isPinned: boolean;
    isDeleted: boolean;
}

export interface Product {
    _id: string;
    name: string;
    createdAt: Date;
    description?: string;
    defaultQty: number; 
    unit: string;
    categoryId: string;
    userId: string;
    storeIds?: string[];
    tags?: string[];
    isDeleted: boolean;
}

export interface ShoppingListItem {
    _id: string;
    createdAt: Date;
    updatedAt?: Date;
    name: string;
    isChecked: boolean;
    qty: number;
    unit: string;
    productId?: string; // Link to an existing product from user's colection
    listId: string; // Parent list
    description: string;
    isPinned: boolean; // Pinned items are shown at the top of the list
    category?: {
        _id?: string; // Link to a category used locally
        name: string; // Hard-copy of local category name
        color: string; // Hard-copy of local category color
    };
    store?: {
        _id?: string;
        name: string;
        color?: string;
    };
    tags?: string[];
    isDeleted: boolean;
    priority: "low" | "normal" | "high";
}

export interface PurchasedItem {
    _id: string;
    userId: string;
    productId?: string; // Link to an existing product but optinoal in case the product gets deleted
    name: string; 
    unit: string;
    qty: number;
    totalPrice: number;
    storeId: string;
    purchasedAt: Date;
    isDiscounted?: boolean;
}

export interface Category {
    _id: string;
    name: string;
    color: string;
}

export interface Store {
    _id: string;
    name: string;
    color?: string;
}

export interface Recipe {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    instructions: string[];
    ingredients: RecipeIngredient[]; 
    isDeleted: boolean;

}

export interface RecipeIngredient {
    productId: string; // Link to existing products
    name: string; // Hard-copy of product name
    quantity: number;
    unit: string;
    notes?: string; // Optional notes about the product
}