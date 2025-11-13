import { useState } from 'react';
import styles from './NewShoppingList.module.css';
import type { ShoppingList } from '../../types/models';
import { ObjectId } from 'bson';
import SwitchButton from '../SwitchButton/SwitchButton';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';

interface IProps {
    close: ()=>void;
}

const NewShoppingList: React.FC<IProps> = ({close}) => {

    const { showNotification } = useNotifications();

    const [name, setName] = useState('')
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [color, setColor] = useState('#FFFFF');



    const handleSaveList = async () => {
        const currentDate = new Date();
        const newList: ShoppingList = {
            _id: new ObjectId().toString(),
            name,
            description,
            color,
            isPinned,
            userId: 'local',
            createdAt: currentDate,
            isDeleted: false,
        };
        await db.shoppingLists.add(newList);
        showNotification("List created successfully", "success");
        close();
    }
    return ( 
        <div className={styles.newShoppingList}>
            <h3>New Shopping List</h3>
            <fieldset>
                <label>Name</label>
                <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} minLength={0} placeholder='Shopping list name' />
            </fieldset>
            <fieldset>
                <label>Description</label>
                <input type='text' name='description' onChange={(e)=>setDescription(e.target.value)} value={description} minLength={0} placeholder='What is this list for?' />
            </fieldset>
            <div className={styles.twoCols}>
                <div style={{display: 'flex', justifyContent: "space-between", alignItems: 'center'}}>
                    <label>Pin List</label>
                    <SwitchButton isActivated={isPinned} onPress={()=>setIsPinned(prev=>!prev)} />
                </div>
                <div style={{display: 'flex', justifyContent: "space-between", alignItems: 'center'}}>
                    <label>Color:</label>
                    <input type='color' name='color' onChange={(e)=>setColor(e.target.value)} value={color} />
                </div>
            </div>
            <div className={styles.twoCols}>
                <button className={styles.cancelButton} onClick={close}>Cancel</button>
                <button className={styles.saveButton} onClick={handleSaveList}>Save</button>
            </div>
        </div>
     );
}
 
export default NewShoppingList;