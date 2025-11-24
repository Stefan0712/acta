import { useState } from 'react';
import styles from './NewGroup.module.css';
import type { Group, GroupMember } from '../../types/models';
import { ObjectId } from 'bson';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';

const NewGroup = ({close, addGroup}: {close: ()=>void, addGroup: (newGroup: Group) => void}) => {

    const { showNotification } = useNotifications();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');


    const handleCreateGroup = async () => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username')
        if(userId){
            try {
                const user: GroupMember = {
                    userId,
                    username: username ?? 'No Username',
                    role: 'owner'
                }
                const newGroup: Group = {
                    _id: new ObjectId().toString(),
                    authorId: userId,
                    name: name ?? "My group",
                    description,
                    members: [user],
                }
                await db.groups.add(newGroup);
                addGroup(newGroup)
                showNotification("Group created successfully", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to create group", "error");
            }
        }
        
    }
    return ( 
        <div className={styles.newGroup}>
            <div className={styles.content}>
                <h3>New Group</h3>
                <fieldset>
                    <label>Group Name</label>
                    <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} required minLength={0} placeholder='My Group' />
                </fieldset>
                <fieldset>
                    <label>Description</label>
                    <input type='text' name='description' onChange={(e)=>setDescription(e.target.value)} value={description} minLength={0} placeholder='Write something about your group here...' />
                </fieldset>
                <div className={styles.buttons}>
                    <button onClick={close}>Close</button>
                    <button onClick={handleCreateGroup}>Create</button>
                </div>
            </div>
        </div>
     );
}
 
export default NewGroup;