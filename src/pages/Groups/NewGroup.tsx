import { useState } from 'react';
import styles from './NewGroup.module.css';
import type { Group, GroupMember } from '../../types/models';
import { ObjectId } from 'bson';
import { useNotifications } from '../../Notification/NotificationContext';
import { createGroup } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../../components/IconSelector/iconCollection';
import IconSelector from '../../components/IconSelector/IconSelector';

const NewGroup = ({close, addGroup}: {close: ()=>void, addGroup: (newGroup: Group) => void}) => {

    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [icon, setIcon] = useState<string>('default-icon');
    const [color, setColor] = useState('white');

    const [showIconSelector, setShowIconSelector] = useState(false);


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
                clientId: newId,
                icon,
                color
            }
            setIsCreating(true);
            try {
                console.log(newGroup)
                const groupResponse = await createGroup(newGroup);
                console.log(groupResponse.icon)
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
    const SelectedIcon = getIcon(icon);

    const DEFAULT_COLORS = [
        "#6366f1", // Indigo
        "#10b981", // Emerald
        "#f43f5e", // Rose
        "#f59e0b", // Amber
        "#0ea5e9", // Sky
        "#8b5cf6", // Violet
    ];
    return ( 
        <div className={styles.newGroup}>
            {showIconSelector ? <IconSelector close={()=>setShowIconSelector(false)} icon={icon} setIcon={(newIcon)=>setIcon(newIcon)} /> : null}
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
                <div className={styles.customizationInputs}>
                    <fieldset>
                        <label>Color</label>
                        <div className={styles.colors}>
                            {DEFAULT_COLORS.map(c=><div onClick={()=>setColor(c)} key={c} className={`${styles.colorButton} ${color === c ? styles.selectedColor : ''}`} style={{backgroundColor: c}} />)}
                        </div>
                    </fieldset>
                    <fieldset>
                        <label>Icon</label>
                        <button className={styles.iconButton} onClick={()=>setShowIconSelector(true)}><SelectedIcon stroke={color}/></button>
                    </fieldset>
                </div>
                <div className={styles.buttons}>
                    <button onClick={close}>Close</button>
                    <button onClick={handleCreateGroup} disabled={isCreating}>{isCreating ? 'Saving...' : 'Create'}</button>
                </div>
            </div>
        </div>
     );
}
 
export default NewGroup;