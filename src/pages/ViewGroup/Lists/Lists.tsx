import { useMemo, useState } from 'react';
import styles from './Lists.module.css';
import type { List } from '../../../types/models';
import { IconsLibrary } from '../../../assets/icons';
import NewList from '../../../components/NewList/NewList';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../../Notification/NotificationContext';
import { deleteList, updateList } from '../../../services/listService';
import Loading from '../../../components/LoadingSpinner/Loading';
import { db } from '../../../db';
import { getIcon } from '../../../components/IconSelector/iconCollection';
import Header from '../../../components/Header/Header';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import Summaries from '../../../components/Summaries/Summaries';
import { useLiveQuery } from 'dexie-react-hooks';
import { useListStats } from '../../../helpers/useListStats';


const Lists = () => {

    const navigate = useNavigate();
    const { groupId } = useParams();

    
    const [showNewList, setShowNewList] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('active');

    
    const lists = useLiveQuery( async () => {
        if (groupId) {
            return await db.lists
                .where('groupId').equals(groupId)
                .reverse()
                .toArray();
        } else {
            return await db.lists
                .filter(list => !list.groupId)
                .reverse()
                .toArray()
        }
    }, [groupId]);

    const filteredLists = useMemo(() => {
        if (!lists) return [];

        return lists.filter(list => {
            switch (selectedFilter) {
                case 'active':
                    return !list.isDeleted;
                case 'deleted':
                    return list.isDeleted === true;
                default:
                    return false;
            }
        });
    }, [lists, selectedFilter]);

    if (!localStorage.getItem('jwt-token') && groupId) {
        navigate('/auth;')
    } else if(!lists) {
        return ( <Loading /> )
    } else if (lists) {
        return ( 
            <div className={styles.lists} style={!groupId ? {gridTemplateRows: 'var(--page-header-height) auto 40px 1fr'} : {}}>
                {!groupId ? 
                    <Header title='My Lists' />
                : null}
                <Summaries totalItems={lists.length} completedItems={lists.filter(list=>list.completedItemsCounter === list.totalItemsCounter && list.completedItemsCounter && list.completedItemsCounter > 0).length} />
                <select className='category-selector' value={selectedFilter} onChange={(e)=>setSelectedFilter(e.target.value)}>
                    <option value={'active'}>Active</option>
                    <option value={'deleted'}>Deleted</option>
                </select>
                <div className={styles.listsContainer}>
                    {showNewList ? <NewList close={()=>setShowNewList(false)} groupId={groupId} /> : null}
                    {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                        <IconsLibrary.Plus />
                    </button>}
                    {filteredLists?.length > 0 ? filteredLists.map((list, index)=><List
                        data={list} 
                        key={index} 
                    />) : <p className='no-items-text'>There are no lists.</p>}
                </div>
            </div>
        );
    }
}
    
export default Lists;

interface ListProps {
    data: List;
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
        // If syncStatus is 'pending', it means we haven't successfully created it on the server yet.
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

                // If this list was waiting to be created (pending), remove that 
                // action from the queue. Otherwise, the worker will create it later
                // Search for any queue items where the payload has this ID.
                await db.syncQueue
                    .filter(action => action.payload && (action.payload.id === data._id || action.payload._id === data._id))
                    .delete();
            });

            showNotification("List deleted", "success");
        } catch (error) {
            console.error("Delete failed:", error);
            
            // If server gives 404, it implies it's already deleted
            if (isServerAware && error.response && error.response.status === 404) {
                // Try again treating it as local-only
                showNotification("List was already deleted on server. Cleaning up local copy...", "info");
                await db.lists.delete(data._id); // Force local cleanup
            } else {
                showNotification("Failed to delete list.", "error");
            }
        }
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