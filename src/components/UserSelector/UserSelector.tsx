import { useEffect, useMemo, useState } from 'react';
import type { GroupMember } from '../../types/models';
import styles from './UserSelector.module.css';
import { getGroup } from '../../services/groupService';
import { handleAssignItem } from '../../services/itemService';
import { useNotifications } from '../../Notification/NotificationContext';

interface UserSelectorProps {
    groupId: string;
    close: ()=>void;
    itemId: string;
}
const UserSelector: React.FC<UserSelectorProps> = ({groupId, close, itemId}) => {

    const {showNotification} = useNotifications();
    const userId = localStorage.getItem('userId');

    const [users, setUsers] = useState<GroupMember[]>([]);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers: GroupMember[] = useMemo(()=>{
        if (!users || users.length === 0) return [];
    
        if (searchQuery.length === 0) {
            return users.filter(item => item.userId !== userId);
        }
        return users.filter(item => 
            item.username?.toLowerCase().includes(searchQuery.toLowerCase()) && 
            item.userId !== userId
        );
    },[searchQuery, users, userId]);

    const getUsers = async () => {
        try {
            const groupData = await getGroup(groupId);
            if(groupData && groupData.members) {
                setUsers(groupData.members);
            }
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(()=>{
        getUsers();
    },[])

    const handleSelectUser = async (selectedUserId: string) => {
        if(itemId){
            try {
                const apiResponse = await handleAssignItem(itemId,{assignedTo: selectedUserId});
                if (apiResponse) {
                    showNotification('User assigned successfully!', "success");
                    close();
                }
            } catch (error) {
                console.error(error);
                showNotification('Failed to assign user. Try again', "error");
            }
        }
    }
    const currentUser = users?.find(item=>item.userId === userId);
    return ( 
        <div className={styles.userSelector}>
            <div className={styles.header}><h1>Assign to</h1></div>
            <input type='text' name='search-box' className={styles.searchBox} onChange={(e)=>setSearchQuery(e.target.value)} value={searchQuery} placeholder='Search user' />
            <div className={styles.container}>
                {currentUser ? <button className={styles.claimButton} onClick={()=>handleSelectUser(currentUser.userId)}>Claim Item</button> : null}
                {
                    filteredUsers?.length > 0 ? filteredUsers.map(user=><div key={user.userId} className={`${styles.user}`} onClick={()=>handleSelectUser(user.userId)}>
                        <p>{user.username || "No Username Found"} {localStorage.getItem('userId') === user.userId ? '( you )' : null}</p>
                        <b>{user.role.slice(0,1).toUpperCase() + user.role.slice(1)}</b>
                    </div>) : <p className='no-items-text'>No users found</p>
                }
            </div>
            <button className={styles.closeButton} onClick={close}>Close</button>
        </div>
     );
}
 
export default UserSelector;