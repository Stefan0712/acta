import type { AuthResponse } from '../services/authService'; 
import { db } from '../db';

export async function finalizeAuthentication(authResponse: AuthResponse): Promise<void> {
    
    // Get the new permanent MongoDB ID and the anonymous ID from localStorage
    const mongoId = authResponse.user._id;
    const token = authResponse.token;
    
    // Store user info
    localStorage.setItem('jwt-token', token);
    localStorage.setItem('userId', mongoId)
    localStorage.setItem('username', authResponse.user.username)
    const currentUserId = localStorage.getItem('userId');
    // Check if anonymous data needs to be transferred
    if (currentUserId !== 'local-user-id') {
        // User was already registered or is logging in on a new device.
        console.log(`Login successful for user ${mongoId}. No anonymous data transfer required.`)
        return;
    }    
    try {
        const tempId = 'local-user-id';
        // If any step fails, the entire transaction is rolled back.
        await db.transaction('rw', db.shoppingLists, db.shoppingListItems, db.notes, db.groups, async () => {            
            // Swap ownerId and mark records as dirty (PUSH required)            
            await db.shoppingLists
                .where('authorId').equals(tempId)
                .modify({ authorId: mongoId, isDirty: true });

            await db.shoppingListItems
                .where('authorId').equals(tempId)
                .modify({ authorId: mongoId, isDirty: true });
            
            await db.notes
                .where('authorId').equals(tempId)
                .modify({ authorId: mongoId, isDirty: true });

            // For groups, if the user was the anonymous creator
            await db.groups
                .where('authorId').equals(tempId)
                .modify({ authorId: mongoId, isDirty: true });
            localStorage.setItem('userId', mongoId);
        });


    } catch (error) {
        console.error("Failed to complete ownership transfer transaction.", error);
        
        // On critical failure, roll back the session to prevent half-synced state
        localStorage.removeItem('jwt-token'); 
        
        throw new Error("Login failed due to a critical database synchronization error.");
    }
    
}