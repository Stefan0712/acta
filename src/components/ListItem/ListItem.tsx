import styles from './ListItem.module.css';
import { type ShoppingListItem as ItemInterface } from '../../types/models';
import { IconsLibrary } from '../../assets/icons';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { useEffect, useRef, useState } from 'react';
import { getDateAndHour } from '../../helpers/dateFormat';


interface ListItemProps {
    data: ItemInterface;
    updateItem: (item: ItemInterface) => void;
}
const ListItem: React.FC<ListItemProps> = ({data, updateItem}) => {

    const {showNotification} = useNotifications();
    const metaRef = useRef<HTMLDivElement>(null);
    
    const [expandItem, setExpandItem] = useState(false);

    useEffect(() => {
        if (expandItem && metaRef?.current) {
            metaRef.current.style.height = `${metaRef.current.scrollHeight}px`;
        } else if(metaRef?.current) {
            metaRef.current.style.height = '30px';
        }
    }, [expandItem]);


    const toggleCheck = async () =>{
        try {
            const newValue = !data.isChecked;
            await db.shoppingListItems.update(data._id, {isChecked: newValue});
            updateItem({...data, isChecked: newValue});
        } catch (error) {
            console.error(error);
            showNotification("Failed to check item", "error")
        }
    };
    const togglePin = async () =>{
        try {
            const newValue = !data.isPinned;
            await db.shoppingListItems.update(data._id, {isPinned: newValue});
            updateItem({...data, isPinned: newValue});
            showNotification(newValue ? "Item pinned!" : "Item unpinned", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to pin item", "error")
        }
    };
    const handleDelete = async () =>{
        try {
            const newValue = !data.isDeleted;
            await db.shoppingListItems.update(data._id, {isDeleted: newValue});
            updateItem({...data, isDeleted: newValue});
            showNotification(newValue ? "Item deleted succesfully." : "Item restored succesfully.", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete item", "error")
        }
    };

    if(data){
        return ( 
            <div className={`${styles.item} ${expandItem ? styles.expandedItem : ''}`}>
                <div className={styles.mainSection}>
                    <div className={styles.checkbox} onClick={toggleCheck}>
                        {data.isChecked ? <IconsLibrary.Checkmark /> : null}
                    </div>
                    <p onClick={()=>setExpandItem(prev=>!prev)}>{data.name}</p>
                    <b>{data.qty} {data.unit}</b>
                </div>
                <div className={styles.itemMeta} ref={metaRef}>
                    <p className={styles.createdAt}>{data.createdAt ? `Added on ${getDateAndHour(data.createdAt)}` : ''}</p>
                    {data.description ? null : <p>No description</p> }
                    <div className={styles.twoCols}>
                        <div className={styles.col}>
                            <IconsLibrary.Category />
                            <p>{data?.category?.name ?? 'No category'}</p>
                        </div>
                        <div className={styles.col}>
                            <IconsLibrary.Store />
                            <p>{data?.store?.name ?? 'No store'}</p>
                        </div>
                    </div>
                    <div className={styles.threeCol}>
                        <div className={styles.col} onClick={togglePin}>
                            {data.isPinned ? <IconsLibrary.FullStar /> : <IconsLibrary.Star />}
                            <p>{data.isPinned ? 'Unpin' : 'Pin' }</p>
                        </div>
                        <div className={styles.col}>
                            <IconsLibrary.Edit />
                            <p>Edit</p>
                        </div>
                        <div className={styles.col} onClick={handleDelete}>
                            {data.isDeleted ? <IconsLibrary.Undo /> : <IconsLibrary.Delete />}
                            <p>{data.isDeleted ? "Restore" : "Delete"}</p>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
 
export default ListItem;