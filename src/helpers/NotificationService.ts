import { ObjectId } from 'bson';
import { db } from '../db';
import type { Notification, NotificationCategory } from '../types/models';

interface SendProps {
    recipientId: string, 
    category: NotificationCategory, 
    message: string, 
    groupId?: string, 
    metadata?: Notification['metadata']
}
export const NotificationService = {
    async send({recipientId, category, message, groupId, metadata}: SendProps) {
        const newNotification: Notification = {
            _id: new ObjectId().toString(),
            recipientId,
            groupId,
            category,
            message,
            isRead: false,
            createdAt: new Date(),
            metadata
        };
        try {
            await db.notifications.add(newNotification);
        } catch (error) {
            console.error("Failed to send notification", error);
        }
    },

    async markAsRead(notificationId: string) {
        await db.notifications.update(notificationId, { isRead: true });
    },

    async markGroupAsRead(recipientId: string, groupId: string) {
        await db.notifications.where({ recipientId, groupId }).modify({ isRead: true });
    },

    async markAllAsRead(recipientId: string) {
        await db.notifications.where({ recipientId }).modify({ isRead: true });
    },


    async delete(notificationId: string) {
        await db.notifications.delete(notificationId);
    },

    async deleteGroup(recipientId: string, groupId: string) {
        await db.notifications.where({ recipientId, groupId }).delete();
    },

    async deleteAll(recipientId: string) {
        await db.notifications.where({ recipientId }).delete();
    }  , 

    // Checking for reminders
    async checkLocalReminders(currentUserId: string) {
        const now = new Date();
        const activeItems = await db.shoppingListItems
        .filter(item => 
            !item.isChecked &&          // Not bought yet
            !!item.deadline &&          // Has a deadline
            item.reminder > 0 &&        // Wants a reminder
            !item.isReminderSent        // Hasn't been reminded yet
        )
        .toArray();
        for (const item of activeItems) {
            if (!item.deadline) continue;
            const deadlineTime = new Date(item.deadline).getTime();
            const nowTime = now.getTime();
            const msUntilDeadline = deadlineTime - nowTime;
            const hoursUntilDeadline = msUntilDeadline / (1000 * 60 * 60);

            if (hoursUntilDeadline <= item.reminder && hoursUntilDeadline > -12) {
                await this.send(currentUserId, 'REMINDER', `Reminder: "${item.name}" is due in ${Math.ceil(hoursUntilDeadline)} hours!`, undefined, { listId: item.listId, itemId: item._id });
                await db.shoppingListItems.update(item._id, { isReminderSent: true });
                console.log(`[Reminders] Sent alert for ${item.name}`);
            }
        }
    }
};