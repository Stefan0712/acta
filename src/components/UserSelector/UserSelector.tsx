import { useState } from 'react';
import type { GroupMember } from '../../types/models';
import styles from './UserSelector.module.css';

interface UserSelectorProps {
    users: GroupMember[];
    selectUser: (userId: string) => void;
    selectedUser: string | null;
    close: ()=>void;
}
const UserSelector: React.FC<UserSelectorProps> = ({users, selectUser, selectedUser, close}) => {

    const userId = localStorage.getItem('userId');

    const [searchQuery, setSearchQuery] = useState('');

    const handleSelect = (userId: string) => {
        selectUser(userId);
        close();
    }
    return ( 
        <div className={styles.userSelector}>
            <input type='text' name='search-box' className={styles.searchBox} onChange={(e)=>setSearchQuery(e.target.value)} value={searchQuery} placeholder='Search user' />
            <div className={styles.container}>
                {
                    users?.length > 1 ? users.filter(item=>item.userId !== userId).map(user=><div className={`${styles.user} ${selectedUser === user.userId ? styles.selectedUser : ''}`} onClick={()=>handleSelect(user.userId)}>
                        <p>{user.username || "Guest User"}</p>
                        <b>{user.role}</b>
                    </div>) : <p className='no-items-text'>No users found</p>
                }
            </div>
            <button className={styles.closeButton} onClick={close}>Close</button>
        </div>
     );
}
 
export default UserSelector;