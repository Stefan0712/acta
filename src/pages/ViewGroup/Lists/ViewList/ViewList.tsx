import { useMemo, useState } from 'react';
import styles from './ViewList.module.css';
import { type GroupMember } from '../../../../types/models';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useNotifications } from '../../../../Notification/NotificationContext';
import NewItem from '../../../../components/NewItem/NewItem';
import { getDateAndHour } from '../../../../helpers/dateFormat.ts';
import EditList from '../../../../components/EditList/EditList';
import GroupListItem from '../GroupListItem/GroupListItem.tsx'
import {  updateList } from '../../../../services/listService.ts';
import Loading from '../../../../components/LoadingSpinner/Loading.tsx';
import { IconsLibrary } from '../../../../assets/icons.ts';
import UserSelector from '../../../../components/UserSelector/UserSelector.tsx';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal.tsx';
import { db } from '../../../../db.ts';
import { useLiveQuery } from 'dexie-react-hooks';
import { ObjectId } from 'bson';

interface IListOutletContext {
  members: GroupMember[]; 
}

const ViewList = () => {

    const {listId} = useParams();
    const {members} = useOutletContext<IListOutletContext>();
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const { showNotification } = useNotifications();


    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');


    const [showAssignUser, setShowAssignUser] = useState<null | string>(null);
    const [showMore, setShowMore] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    const data = useLiveQuery(async () => {
        if (!listId) return null;

        const [list, items] = await Promise.all([
            db.lists.get(listId),
            db.listItems.where('listId').equals(listId).toArray()
        ]);
        return { list, items };
    }, [listId]);
    

    const { list, items } = data || { list: null, items: [] };

    // Filter items based on the current category
    const filteredItems = useMemo(() => {
        if (!items) return [];
        if(selectedCategory === 'all'){
            return items.filter(item=>!item.isDeleted);
        }else if(selectedCategory === 'pinned') {
            return items.filter(item=>item.isPinned && !item.isDeleted);
        }else if(selectedCategory === 'mine') {
            return items.filter(item=>(item.assignedTo === userId || item.claimedBy === userId) && !item.isDeleted);
        }else if(selectedCategory === 'deleted') {
            return items.filter(item=>item.isDeleted);
        }
        return [];
    }, [items, selectedCategory, userId]);

 
    // Filter filtered items into completed and uncompleted
    const uncompletedItems = useMemo(()=> {
        return filteredItems.filter(item => !item.isChecked);
    },[filteredItems]);

    const completedItems = useMemo(()=> {
        return filteredItems.filter(item => item.isChecked);
    },[filteredItems]);


    
    const restoreList = async () =>{
       if(listId) {
         try {
            await updateList(listId, {isDeleted: false});
            await db.lists.update(listId, {isDeleted: false});
            showNotification("List restored", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to restore list.", "error");
        }
       }
    }
    const handleDeleteList = async () =>{
        if(list && list._id) {
            try {
                await updateList(list._id,{isDeleted: true});
                await db.lists.update(list._id, {isDeleted: true})
                showNotification("List deleted", "success");
                navigate(`/group/${list.groupId}`);
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete list.", "error");
            }
        }
    }   

    const handleCopyList = async () => {
        try {
            if(list){
                const listToSave = {...list, lastSyncedAt: new Date(), _id: new ObjectId().toHexString()};
                const itemsToSave = [...items];
                await db.transaction('rw', db.lists, db.listItems, async () => {
                    await db.lists.put(listToSave);
                    await db.listItems.where({listId: listToSave._id}).delete();
                    await db.listItems.bulkPut(itemsToSave);
                })
                showNotification("List copied locally!", "success");
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to copy list locally", "error");
        }

    }

    const totalItems = items && items.length >= 0 ? items.filter(item=>!item.isDeleted).length : 0
    const checkedItems = items && items.length >= 0 ? items.filter(item=>item.isChecked && !item.isDeleted).length : 0
    const percentage = (checkedItems/totalItems)*100 || 0;


    if (!localStorage.getItem('jwt-token')){
        navigate('/auth');
    }else if (!data) {
        return <Loading />
    } else if(list) {
        return ( 
            <div className={styles.viewList}>
                {showEdit ? <EditList close={()=>setShowEdit(false)} listData={list}/> : null}
                {showAssignUser && list.groupId ? <UserSelector close={()=>setShowAssignUser(null)} itemId={showAssignUser} groupId={list.groupId} /> : null}
                {showDeleteModal ? <ConfirmationModal 
                            title='Delete list?' 
                            content='Are you sure you want to delete this list? You can restore it later' 
                            cancel={()=>setShowDeleteModal(false)}
                            confirm={handleDeleteList}
                        />
                    : null
                }
                <div className={styles.listInfo}>
                    <div className={styles.listName}>
                        <h2>{list.name}</h2>
                    </div>
                    <div className='progress'>
                        <div className='progressText'>
                            <p></p>
                            <b>{percentage.toFixed(2) || 0}%</b>
                        </div>
                        <div className='progressBar'>
                            <div className='progressLine' style={{width: `${percentage}%`}} />
                        </div>
                    </div>
                    {showMore ? <>
                    <div className={styles.listMeta}>
                        <div className={styles.listTimestamps}>
                            <p className={styles.createdAt}><IconsLibrary.Calendar />{getDateAndHour(list.createdAt)}</p>
                            <p className={styles.updatedAt}><IconsLibrary.Sync /> {list.updatedAt ? getDateAndHour(list.updatedAt) : getDateAndHour(list.createdAt)}</p>
                        </div>
                        <p className={styles.description}>{list.description || "Description was not set for this list."}</p>
                    </div>
                    <div className={styles.listButtons}>
                        {list.isDeleted ? null : <button onClick={handleCopyList}>{list.lastSyncedAt ? <><IconsLibrary.Sync /> Update</> : <> <IconsLibrary.Copy /> Copy List</>}</button>}
                        {list.isDeleted ? null : <button onClick={()=>setShowEdit(true)}><IconsLibrary.Edit /> Edit List</button>}
                        {list.isDeleted ? <button onClick={restoreList}><IconsLibrary.Sync /> Restore List</button> : null}
                        {list.isDeleted ? null : <button onClick={()=>setShowDeleteModal(true)}><IconsLibrary.Delete /> Delete List</button>}
                    </div>
                    </> : null}
                </div>
                <div className={styles.listFilters}>
                    <select className='category-selector' value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)}>
                        <option value={'all'}>All</option>
                        <option value={'pinned'}>Pinned</option>
                        <option value={'mine'}>Mine</option>
                        <option value={'deleted'}>Deleted</option>
                    </select>
                    <div className={styles.buttons}>
                        <button className={styles.showMoreButton} onClick={()=>setShowMore(prev=>!prev)}>{showMore ? 'Show less' : 'Show more'}<IconsLibrary.Arrow style={showMore ? {transform: 'rotateZ(90deg)'} : {transform: 'rotateZ(-90deg)'} } /></button>
                    </div>
                </div>
                <div className={styles.listItemsContainer}>
                    { filteredItems && filteredItems.length > 0 ? 
                        <>
                            {uncompletedItems
                                .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
                                .map(item=><GroupListItem showAssignUser={()=>setShowAssignUser(item._id)} groupId={list.groupId} online={true} key={item._id} members={members} data={item} />)}
                            {completedItems.length > 0 ? <h3>Completed</h3> : null}
                            {completedItems.map(item=><GroupListItem showAssignUser={()=>setShowAssignUser(item._id)} groupId={list.groupId} online={true} key={item._id} members={members} data={item} />)}
                        </>  : 
                            <p className='no-items-text'>No items yet</p>
                    }
                </div>
                {list._id && members ? <NewItem listId={list._id} online={true} /> : null}
            </div>
        );
    }
    
}
 
export default ViewList;