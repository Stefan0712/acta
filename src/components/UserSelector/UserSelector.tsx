import { useEffect, useState } from 'react';
import type { GroupMember } from '../../types/models';
import styles from './UserSelector.module.css';
import { getGroup } from '../../services/groupService';

interface UserSelectorProps {
    groupId: string;
    selectUser: (userId: string) => void;
    selectedUser: string | null;
    close: ()=>void;
}
const UserSelector: React.FC<UserSelectorProps> = ({groupId, selectUser, selectedUser, close}) => {

    const [users, setUsers] = useState<GroupMember[]>([])

    const [searchQuery, setSearchQuery] = useState('');

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
    const handleSelect = (userId: string) => {
        selectUser(userId);
        close();
    }
    return ( 
        <div className={styles.userSelector}>
            <div className={styles.header}><h1>Assign to</h1></div>
            <input type='text' name='search-box' className={styles.searchBox} onChange={(e)=>setSearchQuery(e.target.value)} value={searchQuery} placeholder='Search user' />
            <div className={styles.container}>
                {
                    users?.length > 0 ? users.map(user=><div className={`${styles.user} ${selectedUser === user.userId ? styles.selectedUser : ''}`} onClick={()=>handleSelect(user.userId)}>
                        <p>{user.username || "Guest User"}</p>
                        <b>{user.role.slice(0,1).toUpperCase() + user.role.slice(1)}</b>
                    </div>) : <p className='no-items-text'>No users found</p>
                }
            </div>
            <button className={styles.closeButton} onClick={close}>Close</button>
        </div>
     );
}
 
export default UserSelector;