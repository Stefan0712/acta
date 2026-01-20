import styles from './ListItem.module.css';
import { type ListItem as ItemInterface } from '../../types/models';
import { IconsLibrary } from '../../assets/icons';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { useEffect, useRef, useState } from 'react';
import { getDateAndHour } from '../../helpers/dateFormat';
import { formatDeadline } from '../../helpers/deadlineFormatter';
import EditItem from '../EditItem/EditItem';
import { handleUpdateItem } from '../../services/itemService';
import { Pin } from 'lucide-react';


interface ListItemProps {
    data: ItemInterface;
    online: boolean;
}
const ListItem: React.FC<ListItemProps> = ({data, online}) => {

    const {showNotification} = useNotifications();
    const metaRef = useRef<HTMLDivElement>(null);
    
    const [expandItem, setExpandItem] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

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
            if(online){
                await handleUpdateItem(data._id, {isChecked: newValue});
                console.log(online)
            } else {
                await db.listItems.update(data._id, {isChecked: newValue});
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to check item", "error")
        }
    };
    const togglePin = async () =>{
        try {
            const newValue = !data.isPinned;
            if(online){
                await handleUpdateItem(data._id, {isPinned: newValue});
            } else {
                await db.listItems.update(data._id, {isPinned: newValue});
            }
            showNotification(newValue ? "Item pinned!" : "Item unpinned", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to pin item", "error")
        }
    };
    const handleDelete = async () =>{
        try {
            const newValue = !data.isDeleted;
            if(online){
                await handleUpdateItem(data._id, {isDeleted: newValue});
            } else {
                await db.listItems.update(data._id, {isDeleted: newValue});
            }
            showNotification(newValue ? "Item deleted succesfully." : "Item restored succesfully.", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete item", "error")
        }
    };

    if(data){
        return ( 
            <div className={`${styles.item} ${expandItem ? styles.expandedItem : ''}`}>
                {showEdit ? <EditItem online={online} itemData={data} close={()=>setShowEdit(false)} /> : null}
                <div className={styles.mainSection}>
                    <div className={styles.checkbox} onClick={toggleCheck}>
                        {data.isChecked ? <IconsLibrary.Checkmark /> : null}
                    </div>

                    <div onClick={()=>setExpandItem(prev=>!prev)} className={styles.mainInfo}>
                        <p>{data.name}</p>
                    </div>
                    <div className={styles.moreMeta}>
                        <b>{data.qty > 0 ? data.qty : ''} {data.unit ?? ''}</b>
                        {data.isPinned ? <Pin /> : null}
                    </div>
                    
                </div>
                <div className={styles.itemMeta} ref={metaRef}>
                    <p className={styles.createdAt}>{data.createdAt ? `Added on ${getDateAndHour(data.createdAt)}` : ''}</p>
                    {data.description ? <p className={styles.description}>{data.description}</p> : null }
                    {data.deadline ? <div className={styles.deadline}>
                        <IconsLibrary.Time />
                        {data.deadline ? <p>Due {formatDeadline(data.deadline)}</p> : <p>No deadline</p>}
                    </div> : null}
                    {data.tags && data.tags.length > 0 ? <div className={styles.tags}>
                        <IconsLibrary.Tag />
                        {data.tags && data.tags.length > 0 ? data.tags?.map(tag=><p key={tag._id} className={styles.tag}>{tag.name}</p>) : <p>No tags</p>}
                    </div> : null}
                    <div className={styles.threeCol}>
                        <div className={styles.col} onClick={togglePin}>
                            {data.isPinned ? <IconsLibrary.FullStar /> : <IconsLibrary.Star />}
                            <p>{data.isPinned ? 'Unpin' : 'Pin' }</p>
                        </div>
                        <div className={styles.col} onClick={()=>setShowEdit(true)}>
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