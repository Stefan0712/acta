import { useEffect, useState } from 'react';
import styles from '../NewList/NewList.module.css';
import type { List } from '../../types/models';
import SwitchButton from '../SwitchButton/SwitchButton';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { updateList } from '../../services/listService';
import IconSelector from '../IconSelector/IconSelector';
import ColorSelector from '../ColorSelector/ColorSelector';
import { getIcon } from '../IconSelector/iconCollection';
import { IconsLibrary } from '../../assets/icons';

interface IProps {
    close: ()=>void;
    listData: List;
}

const EditList: React.FC<IProps> = ({close, listData}) => {

    const { showNotification } = useNotifications();

    const [name, setName] = useState('')
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [color, setColor] = useState('#FFFFF');
    const [icon, setIcon] = useState('default-icon');
    const [error, setError] = useState<null | string>(null)

    const [showIconSelector, setShowIconSelector] = useState(false);
    const [showColorSelector, setShowColorSelector] = useState(false);



const handleSaveList = async () => {
    if (name.length < 1 && name.length > 50){
        setError("Name should be between 0 and 50 characters");
        return;
    }
    
    const isLocalOnly = !listData.syncStatus; // undefined or null
    const isPendingSync = listData.syncStatus === 'pending' || listData.syncStatus === 'pending_update';
    const isSynced = listData.syncStatus === 'synced';

    // Local only
    if (isLocalOnly) {
        try {
            await db.lists.update(listData._id, {
                name, description, color, isPinned
            });
            showNotification("List updated locally", "success");
            close();
        } catch (error) {
            console.error(error);
            showNotification("Failed to update local list", "error");
        }
        return;
    }

    // Pending lists / ghost sync
    if (isPendingSync) {
        try {
            // Update locally because the server doesn't know this ID yet (pending)
            await db.lists.update(listData._id, {
                name, description, color, isPinned,
                // Ensure it stays 'pending_update' or 'pending' so worker picks it up
                syncStatus: listData.syncStatus === 'pending' ? 'pending' : 'pending_update'
            });
            
            // If it was already pending, the existing queue item will pick up these changes 
            // when it runs because it reads the latest data from the DB.
            
            showNotification("List updated (waiting for sync)", "success");
            close();
        } catch (error) {
            console.error(error);
        }
        return;
    }

    // Synced / Cloud list
    if (isSynced) {
        // Online Check
        if (!navigator.onLine) {
            showNotification("You must be online to edit cloud lists.", "error");
            return;
        }

        // API Call
        try {
            const apiResponse = await updateList(listData._id, {
                name, description, color, isPinned
            });

            // Update Local with server response
            await db.lists.update(listData._id, {
                ...apiResponse,
                syncStatus: 'synced' // Re-confirm it matches server
            });

            showNotification("List updated successfully", "success");
            close();

        } catch (error: any) {
            console.error("Save failed", error);
            if (error.response?.status === 404) {
                showNotification("This list no longer exists on the server.", "error");
            } else {
                showNotification("Failed to save changes.", "error");
            }
        }
    }
};

    // Fill in data received from the shopping list
    useEffect(()=>{
        if(listData){
            setName(listData.name);
            setDescription(listData.description ?? "");
            setIsPinned(listData.isPinned);
            setColor(listData.color || 'white');
        }
    },[listData]);
    const SelectedIcon = getIcon(icon);
    return ( 
        <div className={styles.componentContainer}>
            {showIconSelector ? <IconSelector icon={icon} setIcon={(newIcon)=>setIcon(newIcon)} close={()=>setShowIconSelector(false)}/> : null}
            {showColorSelector ? <ColorSelector currentColor={color} setColor={(newColor)=>setColor(newColor)} close={()=>setShowColorSelector(false)}/> : null}
            <div className={styles.newList}>
                <div className={styles.header}>
                    <h3>Edit List</h3>
                    <button onClick={close}>
                        <IconsLibrary.Close />
                    </button>
                </div>
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
                    <button className={styles.closeButton} onClick={close}>close</button>
                    <button className={styles.saveButton} onClick={handleSaveList}>Save</button>
                </div>
            </div>
        </div>
     );
}
 
export default EditList;