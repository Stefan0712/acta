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
    groupId?: string;
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
    authorId: string;
    assignedTo?: string | null;
    claimedBy?: string | null;
    deadline?: Date | null;
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

export interface User {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export type GroupRole = 'owner' | 'moderator' | 'member' | 'guest';

export interface GroupMember {
    userId: string;
    username: string;
    role: GroupRole;
}

export interface Group {
    _id: string;
    name: string;
    description: string;
    authorId: string;
    members: GroupMember[];
}

export interface NoteComment {
    _id: string;
    authorId: string;
    username: string;
    content: string;
    createdAt: string;
}

export interface Note {
    _id: string;
    groupdId: string;
    authorId: string;
    title: string;
    content: string;
    createdAt: Date;
    comments: NoteComment[];
}

export interface Vote {
    userId: string;
    answer: string;
}
export interface Poll {
    _id: string;
    groupId: string;
    question: string;
    createdAt: Date;
    options: {
        _id: string;
        text: string;
        votes: Vote[];
    };
}
