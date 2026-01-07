import { useState } from 'react';
import styles from './NewList.module.css';
import type { List } from '../../types/models';
import { ObjectId } from 'bson';
import SwitchButton from '../SwitchButton/SwitchButton';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { createList } from '../../services/listService';
import { useNavigate } from 'react-router-dom';
import IconSelector from '../IconSelector/IconSelector';
import { getIcon } from '../IconSelector/iconCollection';
import ColorSelector from '../ColorSelector/ColorSelector';

interface IProps {
    close: ()=>void;
    groupId?: string;
    addListToState: (list: List) => void;
}

const NewList: React.FC<IProps> = ({close, groupId, addListToState}) => {

    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [color, setColor] = useState('var(--modal-bg)');
    const [error, setError] = useState('');
    const [icon, setIcon] = useState('default-icon');

    const [showIconSelector, setShowIconSelector] = useState(false);
    const [showColorSelector, setShowColorSelector] = useState(false);

    const handleSaveList = async () => {
        const currentDate = new Date();
        const newList: List = {
            name,
            description,
            color,
            isPinned,
            authorId: localStorage.getItem('userId') ?? 'local-user-id',
            createdAt: currentDate,
            isDeleted: false,
            isDirty: true,
            icon
        };
        if (groupId) {
            newList.groupId = groupId;
        };
        if (!groupId) {
            const localId = new ObjectId().toString();
            newList._id = localId;
            newList.clientId = localId;
        }
        if(!name || (name.length < 3 && name.length > 20)){
            setError("Invalid group name. It should be between 3 and 20 characters!");
        } else {
            if( groupId ) {
                const apiResponse = await createList(newList);
                navigate(`/group/${groupId}/lists/${apiResponse._id}`);
            }else {
                await db.lists.add(newList);
                
                addListToState(newList)
            }
            showNotification("List created successfully", "success");
            close();
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
                    <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} minLength={0} placeholder='Shopping list name' />
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