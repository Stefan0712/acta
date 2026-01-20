export interface List {
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt?: Date;
    color?: string;
    isPinned: boolean;
    isDeleted: boolean;
    groupId: string | null;
    authorId: string;
    clientId?: string | null;
    totalItemsCounter?: number;
    completedItemsCounter?: number;
    icon?: string;
    lastSyncedAt?: Date;
    syncStatus?: string;
}

export interface ListItem {
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
    tags?: Tag[];
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
    icon?: string;
    syncStatus?: string;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt?: string;
    isDirty?: boolean;
}


export interface INotificationPreferences {
  ASSIGNMENT: boolean;
  MENTION: boolean;
  GROUP: boolean;
  REMINDER: boolean;
  POLL: boolean;
}

export interface GroupMember {
  userId: string;
  username?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isPinned: boolean; 
  notificationPreferences: INotificationPreferences;
}

export interface Group {
    _id: string;
    name: string;
    description?: string;
    authorId: string;
    icon: string;
    color: string;
    members: GroupMember[];
    createdAt: Date;
    updatedAt: Date;
    isDirty: boolean;
    isDeleted: boolean;
    listCount?: number;
    notesCount?: number;
    pollCount?: number;
    syncStatus: string;
}

export interface NoteComment {
    _id: string;
    authorId: string;
    username: string;
    content: string;
    createdAt: Date;
    noteId: string;
    syncStatus: string;
}

export interface Note {
    _id: string;
    groupId: string;
    authorId: string;
    title: string;
    content: string;
    createdAt: Date;
    clientId: string | null;
    isDeleted: boolean;
    isPinned: boolean;
    commentCount?: number;
    authorUsername: string;
    syncStatus?: string;
    comments?: NoteComment[];
}
export interface PollOption {
  _id: string;
  text: string;
  votes?: string[]; 
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
  isDirty?: boolean;
  clientId?: string | null;
  isClosed?: boolean;
  syncStatus?: string;
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
export interface Tag {
    _id: string;
    color?: string;
    name: string;
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




export interface Changelog {
    date: string;
    description: string;
    listItems: string[];
}

export interface GroupInvitation {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  groupId: {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
  };

  recipientId: string; 
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}