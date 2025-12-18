import { db } from "./db.ts";
import type { Notification } from "./types/models.ts";



export const seedDatabase = async (userId: string) => {
  const MOCK_NOTIFICATIONS: Notification[] = [
    {
      _id: 'notif-001',
      recipientId: userId,
      authorId: 'user-alex-456', // A real person performed this
      groupId: 'group-family-789',
      category: 'MENTION',
      message: 'Alex mentioned you in the "Weekend Trip" list.',
      isRead: false,
      createdAt: new Date(), // Just now
    },
    {
      _id: 'notif-002',
      recipientId: userId,
      authorId: undefined, // System notification
      groupId: 'group-work-101',
      category: 'REMINDER',
      message: 'Reminder: The "Monthly Report" is due in 2 hours.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    },
    {
      _id: 'notif-003',
      recipientId: userId,
      authorId: 'user-maria-202',
      groupId: 'group-family-789',
      category: 'GROUP',
      message: 'Maria added 5 new items to the "Groceries" list.',
      isRead: true, // Already read
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
    }
  ];
  try {
      await db.notifications.bulkAdd(MOCK_NOTIFICATIONS);
      console.log("Database seeded with notifications")
  } catch (error) {
      console.error(error)
  }
}

export default seedDatabase;