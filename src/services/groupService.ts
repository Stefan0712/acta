import type { Group, Invite, InviteLookupData, ActivityLog, GroupMember, GroupInvitation } from '../types/models.ts';
import API from './apiService.ts';
import axios from 'axios';

interface GroupCreateData {
    name: string;
    description?: string;
}

// TODO: Clean all service functions by removing all those reductand if response === 200 or 201 and the threw new error inside the try block
export async function createGroup(data: GroupCreateData): Promise<Group> {
    try {
        const response = await API.post('/groups', data);
        
        if (response.status === 201) { // No need to use that
            return response.data; 
        }

        throw new Error(response.data.message || 'Failed to create group.'); // Delete this

    } catch (error) {
        // Maybe keep this
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error creating group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Fetches all groups for the current user (GET /api/groups)
export async function getMyGroups(): Promise<Group[]> {
    try {
        const response = await API.get('/groups');

        if (response.status === 200) {
            return response.data.map((group: Group)=>({...group, isDirty: false})); // Array of group objects
        }
        
        throw new Error(response.data.message || 'Failed to fetch groups.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching groups.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Create invite link
export async function generateInviteToken(groupId: string): Promise<Invite> {
    try {
        const response = await API.post<Invite>(`/${groupId}/invites/generate`);
        return response.data; 
        
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to generate invite link.');
        }
        throw new Error('Network error during invite generation.');
    }
}


// Fetch invite information
export async function lookupInvite(token: string): Promise<InviteLookupData> {
    try {
        const response = await API.get<InviteLookupData>(`/invites/lookup?token=${token}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to lookup invite details.');
        }
        throw new Error('Network error during invite lookup.');
    }
}

interface AcceptResponse {
    message: string;
    group: Group;
}

// Accept group invite
export async function acceptInviteToken(token: string): Promise<AcceptResponse> {
    try {
        // Sends the token in the request body
        const response = await API.post<AcceptResponse>('/invites/accept', { token });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to accept the invitation.');
        }
        throw new Error('Network error or issue joining the group.');
    }
}

// Get a group by id
export async function getGroup(groupId: string): Promise<Group> {
    try {
        const response = await API.get(`/groups/${groupId}`);
        if (response.status === 200) {
            return {...response.data, isDirty: false};
        }
        throw new Error(response.data.message || 'Failed to get group.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Delete group
export async function deleteGroup(groupId: string): Promise<string> {
    try {
        const response = await API.delete(`/groups/${groupId}`);

        if (response.status === 200) {
            return response.data.message;
        }
        throw new Error(response.data.message || 'Failed to delete group.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error deleting group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Update group
export async function updateGroup(groupData: Partial<Group>): Promise<Group> {
    try {
        const response = await API.put(`/groups/${groupData._id}`, groupData);

        if (response.status === 200) {
            return response.data;
        }
        throw new Error(response.data.message || 'Failed to update group.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error updating group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Get group's activity
export async function getGroupActivity(groupId: string): Promise<ActivityLog[]> {
    try {
        const response = await API.get(`/activity/${groupId}/`);
        if (response.status === 200) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to get group activity.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching activity.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Leave group
export async function leaveGroup(groupId: string): Promise<string> {
    try {
        const response = await API.delete(`/groups/${groupId}/leave`);

        if (response.status === 200) {
            return response.data.message;
        }
        throw new Error(response.data.message || 'Failed to leave group.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error deleting group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Kick user from group
export async function kickUser(groupId: string, targetUserId: string): Promise<string> {
    try {
        const response = await API.post(`/groups/${groupId}/kick`,{ targetUserId});

        if (response.status === 200) {
            return response.data.message;
        }
        throw new Error(response.data.message || 'Failed to kick the user from the group.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error kicking user from the group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Change member role
export async function changeRole(groupId: string, targetUserId: string, newRole: string): Promise<GroupMember> {
    try {
        const response = await API.put(`/groups/${groupId}/role`, {targetUserId, newRole});

        if (response.status === 200) {
            console.log(response.data)
            return response.data.updatedMember;
        }
        throw new Error(response.data.message || 'Failed to update role.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error updating the role of this user.');
        }
        throw new Error('Network error or unknown issue.');
    }
}


// Send an invite to an user by username
export async function inviteUser(groupId: string, username: string): Promise<string> {
    try {
        const response = await API.post(`/invites/${groupId}`,{ username});
        return response.data.message;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error inviting user to the group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Get user's invites
export async function getInvites(): Promise<GroupInvitation[]> {
    try {
        const response = await API.get(`/invites/`);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error getting your invitations.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

interface InviteResponse {
    groupId: string;
    message: string;
}
// Respond to invite
export async function respondToInvite(inviteId: string, action: string): Promise<InviteResponse> {
    try {
        const response = await API.put(`/invites/${inviteId}/respond`,{action});
        return response.data.message;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error responding to an invitation.');
        }
        throw new Error('Network error or unknown issue.');
    }
}