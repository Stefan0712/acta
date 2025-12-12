import { useState } from 'react';
import styles from './NewGroup.module.css';
import type { Group, GroupMember } from '../../types/models';
import { ObjectId } from 'bson';
import { useNotifications } from '../../Notification/NotificationContext';
import { createGroup } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';

const NewGroup = ({close, addGroup}: {close: ()=>void, addGroup: (newGroup: Group) => void}) => {

    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false)


    const handleCreateGroup = async () => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if(userId && username){
            const user: GroupMember = {
                userId,
                username: username,
                role: 'owner',
            }
            const newId = new ObjectId().toString();
            const newGroup: Group = {
                _id: newId,
                authorId: userId,
                name: name ?? "My group",
                description,
                isDeleted: false,
                isDirty: true,
                createdAt: new Date().toISOString(),
                members: [user],
                clientId: newId
            }
            setIsCreating(true);
            try {
                const groupResponse = await createGroup(newGroup);
                if(groupResponse){
                    addGroup(groupResponse)
                    showNotification("Group created successfully", "success");
                    navigate(`/group/${groupResponse._id}`)
                    close();
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCreating(false)
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
                    <button onClick={handleCreateGroup} disabled={isCreating}>{isCreating ? 'Saving...' : 'Create'}</button>
                </div>
            </div>
        </div>
     );
}
 
export default NewGroup;