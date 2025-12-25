export interface ShoppingList {
    _id?: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt?: Date;
    color?: string;
    isPinned: boolean;
    isDeleted: boolean;
    groupId?: string;
    isDirty: boolean;
    authorId: string;
    clientId?: string | null;
    totalItemsCounter?: number;
    completedItemsCounter?: number;
    icon: string;
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
        _id: string; // Link to a category used locally
        name: string; // Hard-copy of local category name
        color: string; // Hard-copy of local category color
    };
    store?: {
        _id: string;
        name: string;
        color?: string;
    };
    tags?: string[];
    isDeleted: boolean;
    priority: "low" | "normal" | "high";
    authorId: string;
    assignedTo?: string | null;
    claimedBy?: string | null;
    deadline?: string | null;
    reminder: number;
    isReminderSent: boolean;
    isDirty: boolean;
    clientId: string | null;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    isDirty: boolean;
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
    description?: string;
    authorId: string;
    members: GroupMember[];
    isDirty: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    clientId: string | null;
    listCount?: number;
    noteCount?: number;
    pollCount?: number;
    icon: string;
    color: string;
    isPinned: boolean;
}

export interface NoteComment {
    _id: string;
    authorId: string;
    username: string;
    content: string;
    createdAt: Date;
    isDirty: boolean;
    clientId: string | null;
    noteId: string;
}

export interface Note {
    _id: string;
    groupId: string;
    authorId: string;
    title: string;
    content: string;
    createdAt: Date;
    isDirty: boolean;
    clientId: string | null;
    isDeleted: boolean;
    isPinned: boolean;
    commentCount?: number;
    authorUsername: string;
}
export interface PollOption {
  _id: string;
  text: string;
  votes: string[]; 
}

export interface Poll {
  _id: string;
  groupId: string;
  authorId: string;
  authorUsername: string;
  title: string;
  description?: string;
  options: PollOption[];
  allowCustomOptions: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isDirsty: boolean;
  clientId: string | null;
}
export type NotificationCategory = 
  | 'ASSIGNMENT'
  | 'MENTION'
  | 'GROUP'
  | 'REMINDER';

export interface Notification {
    _id: string;
    recipientId: string; // The user that will see this
    authorId?: string; // It is optional because most of the times the "system" will send them, not a user
    groupId?: string; // Used only if the notification is from/to a group
    category: NotificationCategory;
    message: string; // The content of the notification
    isRead: boolean; // Keep track if it was read or not
    createdAt: Date; 
    // Metadata is used for helping user navigate when it clicks/taps the notification
    metadata?: {
        listId?: string;
        itemId?: string;
        noteId?: string;
        pollId?: string;
    };
}

export type ActivityCategory = 
  | 'GROUP'       // Joins, leaves, settings
  | 'CONTENT'     // Items, notes, polls, lists
  | 'INTERACTION'; // Assignments, claims

export interface ActivityLog {
    _id: string;
    groupId: string;
    createdAt: Date;
    category: ActivityCategory; // Just for basic filtering if needed
    
    message: string;            // The text to display
    authorId: string;
    authorName: string; // Denormalized name

    // Metadata for clicking (optional)
    metadata?: {
        listId?: string;
        itemId?: string;
        noteId?: string;
        pollId?: string;
    };
    isDirty: boolean;
}
export interface Invite {
    token: string;
    groupId: string;
    createdBy: string;
    expiresAt: Date;
    maxUses: number;
    usesCount: number;
}
export interface InviteLookupData {
    group: {
        _id: string;
        name: string;
        memberCount: number;
    };
    invitation: {
        groupId: string;
        createdBy: string;
        isExpired: boolean;
        maxUses: number;
        usesCount: number;
        token: string;
        message?: string;
    };
    userIsAuthenticated: boolean;
}