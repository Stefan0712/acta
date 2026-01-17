import { useState } from 'react';
import styles from './NewGroup.module.css';
import type { Group, GroupMember } from '../../types/models';
import { useNotifications } from '../../Notification/NotificationContext';
import { getIcon } from '../../components/IconSelector/iconCollection';
import IconSelector from '../../components/IconSelector/IconSelector';
import SwitchButton from '../../components/SwitchButton/SwitchButton';
import ColorSelector from '../../components/ColorSelector/ColorSelector';
import { ObjectId } from 'bson';
import { offlineCreate } from '../../services/offlineManager';
import { db } from '../../db';

const NewGroup = ({close}: {close: ()=>void}) => {

    const { showNotification } = useNotifications();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [icon, setIcon] = useState<string>('default-icon');
    const [color, setColor] = useState('var(--item-bg)');
    const [isPinned, setIsPinned] = useState(false);

    const [showIconSelector, setShowIconSelector] = useState(false);
    const [showColorSelector, setShowColorSelector] = useState(false)


    const handleCreateGroup = async () => {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if(userId && username){
            const user: GroupMember = {
                userId,
                username: username,
                role: 'owner',
                joinedAt: new Date(),
                isPinned: false,
                notificationPreferences: {
                    POLL: true,
                    ASSIGNMENT: true,
                    MENTION: true,
                    GROUP: true,
                    REMINDER: true
                }
            }
            const newGroup: Group = {
                _id: new ObjectId().toHexString(),
                authorId: userId,
                name: name ?? "My group",
                description,
                isDeleted: false,
                isDirty: true,
                createdAt: new Date(),
                members: [user],
                icon,
                color,
                updatedAt: new Date()
            }
            setIsCreating(true);
            try {
                const groupResponse = await offlineCreate(db.groups, newGroup, 'CREATE_GROUP')
                if(groupResponse){
                    showNotification("Group created successfully", "success");
                    close();
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCreating(false)
            }
        }
    }
    const SelectedIcon = getIcon(icon);

    return ( 
        <div className={styles.newGroup}>
            {showIconSelector ? <IconSelector close={()=>setShowIconSelector(false)} icon={icon} setIcon={(newIcon)=>setIcon(newIcon)} /> : null}
            {showColorSelector ? <ColorSelector close={()=>setShowColorSelector(false)} currentColor={color} setColor={(newColor)=>setColor(newColor)} /> : null}
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
                <div className={styles.threeCols}>
                    <fieldset>
                        <label>Pin</label>
                        <SwitchButton isActivated={isPinned} onPress={()=>setIsPinned(prev=>!prev)} />
                    </fieldset>
                    <fieldset>
                        <label>Color</label>
                        <button onClick={()=>setShowColorSelector(true)} className={styles.colorButton}><div className={styles.color} style={{backgroundColor: color}} /></button>
                    </fieldset>
                    <fieldset>
                        <label>Icon</label>
                        <button className={styles.iconButton} onClick={()=>setShowIconSelector(true)}><SelectedIcon color={color} /></button>
                    </fieldset>
                </div>
                <div className={styles.bottomButtons}>
                    <button onClick={close}>Close</button>
                    <button className={styles.saveButton} onClick={handleCreateGroup} disabled={isCreating}>{isCreating ? 'Saving...' : 'Create'}</button>
                </div>
            </div>
        </div>
     );
}
 
export default NewGroup;