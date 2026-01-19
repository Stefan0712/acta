import { useState } from 'react';
import styles from './NewList.module.css';
import SwitchButton from '../SwitchButton/SwitchButton';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { useNavigate } from 'react-router-dom';
import IconSelector from '../IconSelector/IconSelector';
import { getIcon } from '../IconSelector/iconCollection';
import ColorSelector from '../ColorSelector/ColorSelector';
import { offlineCreate } from '../../services/offlineManager';
import { ObjectId } from 'bson';

interface IProps {
    close: ()=>void;
    groupId?: string;
}

const NewList: React.FC<IProps> = ({close, groupId}) => {

    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [color, setColor] = useState('var(--accent)');
    const [error, setError] = useState('');
    const [icon, setIcon] = useState('default-icon');

    const [showIconSelector, setShowIconSelector] = useState(false);
    const [showColorSelector, setShowColorSelector] = useState(false);

const handleSaveList = async () => {
    if (!name || name.length < 3 || name.length > 50) {
        setError("Invalid list name. It should be between 3 and 50 characters!");
        return;
    }

    try {
        const listData = {
            _id: new ObjectId().toHexString(),
            name,
            description,
            color,
            isPinned,
            authorId: localStorage.getItem('userId') ?? 'local-user',
            groupId: groupId || null, 
            createdAt: new Date(),
            isDeleted: false,
            icon
        };

        const newList = await offlineCreate(db.lists, listData, 'CREATE_LIST');

        showNotification("List created successfully", "success");

        if (groupId) {
            navigate(`/group/${groupId}/lists/${newList._id}`);
        } else {
            navigate(`/lists/${newList._id}`);
        }

        close();

    } catch (error) {
        console.error("Failed to create list:", error);
        setError("Something went wrong while saving.");
    }
};
    const SelectedIcon = getIcon(icon);
    return ( 
        <div className={styles.componentContainer}>
            {showIconSelector ? <IconSelector icon={icon} setIcon={(newIcon)=>setIcon(newIcon)} close={()=>setShowIconSelector(false)}/> : null}
            {showColorSelector ? <ColorSelector currentColor={color} setColor={(newColor)=>setColor(newColor)} close={()=>setShowColorSelector(false)}/> : null}
            <div className={styles.newList}>
                <h3>New List</h3>
                <fieldset>
                    <label>Name</label>
                    <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} minLength={0} placeholder='List name' />
                    {error ? <p className='error-message'>{error}</p> : null}
                </fieldset>
                <fieldset>
                    <label>Description</label>
                    <input type='text' name='description' onChange={(e)=>setDescription(e.target.value)} value={description} minLength={0} placeholder='What is this list for?' />
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
                    <button className={styles.cancelButton} onClick={close}>Cancel</button>
                    <button className={styles.saveButton} onClick={handleSaveList}>Save</button>
                </div>
            </div>
        </div>
     );
}
 
export default NewList;