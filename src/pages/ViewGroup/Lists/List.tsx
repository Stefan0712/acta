import styles from './Lists.module.css';
import { getIcon } from '../../../components/IconSelector/iconCollection';
import { useNotifications } from '../../../Notification/NotificationContext';
import type { List as IList } from '../../../types/models';
import { deleteList, updateList } from '../../../services/listService';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import { useListStats } from '../../../helpers/useListStats';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconsLibrary } from '../../../assets/icons';
import { db } from '../../../db';

interface ListProps {
    data: IList;
}

const List: React.FC<ListProps> = ({data}) => {

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const {showNotification} = useNotifications();

    const {total, completed} = useListStats(data._id);

    const restoreList = async () =>{
        if(data._id) {
            if (data.groupId) {
                try {
                    await updateList(data._id, {isDeleted: false});
                    showNotification("Online list was restored", "success");
                } catch (error) {
                    console.error(error);
                    showNotification("Failed to restore online list.", "error");
                }
            } else {
                try {
                    await db.lists.update(data._id, {isDeleted: false});
                    showNotification('Local list was restored!', "success");
                } catch (error) {
                    console.error(error);
                    showNotification("Failed to restore local list","error")
                }
            }
        }
    }
    const permanentlyDelete = async () => {
        if (!data || !data._id) return;
        console.log(data)
        // Check if the server knows about this list
        // If syncStatus is 'pending', it means it hasn't successfully created it on the server yet.
        const isServerAware = data.syncStatus === 'synced' || data.syncStatus === 'pending_update';

        // Allow deletion only if online
        if (isServerAware && !navigator.onLine) {
            showNotification("You must be online to delete a synced list.", "error");
            return;
        }

        try {
            // Server Delete
            if (isServerAware) {
                await deleteList(data._id); 
            }

            // Local Cleanup
            await db.transaction('rw', db.lists, db.listItems, db.syncQueue, async () => {
                // Delete the list
                await db.lists.delete(data._id);

                // Delete the items
                await db.listItems.where({ listId: data._id }).delete();

                // If this list was waiting to be created (pending), remove that action from the queue.
                // Search for any queue items where the payload has this ID.
                await db.syncQueue
                    .filter(action => action.payload && (action.payload.id === data._id || action.payload._id === data._id))
                    .delete();
            });

            showNotification("List deleted", "success");
        } catch (error) {
            console.error("Delete failed:", error);
            
            // If server gives 404, it is already deleted
            if (isServerAware && error.response && error.response.status === 404) {
                // Try again treating it as local-only
                showNotification("List was already deleted on server. Cleaning up local copy...", "info");
                await db.lists.delete(data._id); // Force local cleanup
            } else {
                showNotification("Failed to delete list.", "error");
            }
        }
        setShowDeleteModal(false);
    }

    const percentage = completed && total && completed > 0 && total > 0 ?  ((completed ?? 0)/(total ?? 0))*100 : 0;
    const Icon = getIcon(data.icon ?? 'default-list-icon')
    return (
        <div className={styles.list}>
        {showDeleteModal ? <ConfirmationModal cancel={()=>setShowDeleteModal(false)}  confirm={permanentlyDelete} title='Delete this list?' content='This will permanently delete this list and all items inside of it and cannot be undone later. Are you sure?' /> : null}
            <Link to={`${data._id}`} className={styles.listInfo}>
              
                <div className={styles.listTop}>
                    <div className={styles.iconContainer} style={{backgroundColor: data.color}}>
                        <Icon />
                    </div>
                    <div className={styles.listInfo}>
                        <h3>{data.name}</h3>
                        <p>{total} items</p>
                    </div>
                </div>
                <div className={styles.listProgress}>
                    <div className={styles.progressBarBackground}>
                        <div className={styles.progressBar} style={{backgroundColor: data.color, width: total === 0 ? '0px' : `${percentage}%`}} />
                    </div>
                    <p>{percentage.toFixed(0)}%</p>
                </div>
            </Link>
            {data.isDeleted ? <div className={styles.deleteButtons}>
                <button onClick={()=>setShowDeleteModal(true)}><IconsLibrary.Delete />Permanently Delete</button>
                <button onClick={restoreList}><IconsLibrary.Undo />Restore</button>
            </div> : null}
        </div>
    )
}

export default List;