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

interface IProps {
    close: ()=>void;
    listData: List;
    updateData: (data: List) => void;
    online?: boolean;
}

const EditList: React.FC<IProps> = ({close, listData, updateData, online}) => {

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
        const currentDate = new Date();
        const updatedList: List = {
            ...listData,
            name,
            description,
            color,
            icon,
            isPinned,
            isDeleted: false,
            updatedAt: currentDate,
        };
        if(!name || (name.length < 3 && name.length > 20)){
            setError("Invalid group name. It should be between 3 and 20 characters!");
        } else {
            try {
                if(online && listData._id){
                    const apiResponse = await updateList(listData._id, updatedList)
                    updateData(apiResponse)
                } else {
                    await db.lists.update(listData._id, updatedList);
                    updateData(updatedList)
                }
                showNotification("List updated successfully", "success");
                close();
            } catch (error) {
                console.error(error)
                showNotification("Failed to update list", "error")
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
 
export default EditList;