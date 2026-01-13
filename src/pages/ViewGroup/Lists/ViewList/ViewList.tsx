import { useEffect, useMemo, useState } from 'react';
import styles from './ViewList.module.css';
import { type ListItem as ItemType, type List as IList, type GroupMember } from '../../../../types/models';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useNotifications } from '../../../../Notification/NotificationContext';
import NewItem from '../../../../components/NewItem/NewItem';
import { getDateAndHour } from '../../../../helpers/dateFormat.ts';
import EditList from '../../../../components/EditList/EditList';
import GroupListItem from '../GroupListItem/GroupListItem.tsx'
import {  getList, updateList } from '../../../../services/listService.ts';
import { getListItems } from '../../../../services/itemService.ts';
import Loading from '../../../../components/LoadingSpinner/Loading.tsx';
import { IconsLibrary } from '../../../../assets/icons.ts';
import UserSelector from '../../../../components/UserSelector/UserSelector.tsx';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal.tsx';

interface IListOutletContext {
  members: GroupMember[]; 
}

const ViewList = () => {

    const {listId} = useParams();
    const {members} = useOutletContext<IListOutletContext>();
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const { showNotification } = useNotifications();


    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [listData, setListData] = useState<IList | null>(null);
    const [listItems, setListItems] = useState<ItemType[]>([]);


    const [showAssignUser, setShowAssignUser] = useState<null | string>(null);
    const [showMore, setShowMore] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Filter items based on the current category
    const filteredItems = useMemo(() => {
        if(selectedCategory === 'all'){
            return listItems.filter(item=>!item.isDeleted);
        }else if(selectedCategory === 'pinned') {
            return listItems.filter(item=>item.isPinned && !item.isDeleted);
        }else if(selectedCategory === 'mine') {
            return listItems.filter(item=>(item.assignedTo === userId || item.claimedBy === userId) && !item.isDeleted);
        }else if(selectedCategory === 'deleted') {
            return listItems.filter(item=>item.isDeleted);
        }
        return [];
    }, [listItems, selectedCategory, userId]);

    // Filter filtered items into completed and uncompleted
    const uncompletedItems = useMemo(()=> {
        return filteredItems.filter(item => !item.isChecked);
    },[filteredItems]);

    const completedItems = useMemo(()=> {
        return filteredItems.filter(item => item.isChecked);
    },[filteredItems]);


    const fetchPageData = async () => {
        if (listId) {
            try {
                const listDataPromise = await getList(listId);
                const listItemsPromise = await getListItems(listId);
                const [listDataResponse, listItemsResponse] = await Promise.all([
                    listDataPromise,
                    listItemsPromise
                ]);
                if (listDataResponse) {
                    setListData(listDataResponse);
                    if(listDataResponse) {
                        setIsPageLoading(false)
                    }
                    setListItems(listItemsResponse);
                } else {
                    showNotification('No list data found', "error");
                }
            } catch (error) {
                console.error("Failed to fetch page data:" , error);
                showNotification("Error loading list", "error")
            }
        }
    };

    const handleUpdateAssigned = (itemId: string, assignedUserId: string) => {
        setListItems(prev=>{
            return prev.map(item=>item._id === itemId
            ? (assignedUserId === userId 
                ? { ...item, claimedBy: assignedUserId, assignedTo: null } 
                : { ...item, claimedBy: null, assignedTo: assignedUserId }
            )
            : item)
        });
        setShowAssignUser(null);
    }
    

    useEffect(()=>{
        if (!listId){
            showNotification("No id found", "error");
            return;
        }else {
            fetchPageData();
        }
    },[listId, showNotification]);

    
    const restoreList = async () =>{
       if(listId) {
         try {
            await updateList(listId, {isDeleted: false})
            showNotification("List restored", "success");
            navigate(-1);
        } catch (error) {
            console.error(error);
            showNotification("Failed to restore list.", "error");
        }
       }
    }
    const handleDeleteList = async () =>{
        if(listData && listData._id) {
            try {
                await updateList(listData._id,{isDeleted: true});
                showNotification("Shopping list deleted", "success");
                navigate(`/group/${listData.groupId}`)
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete list.", "error");
            }
        }
    }
    // Optimistically update item list
    const updateItem = (updatedItem: ItemType) => {
        const updatedList = listItems.map(item=>item._id===updatedItem._id ? updatedItem : item)
        setListItems(updatedList); // Updates the list of all items with the updated one
    };
    const totalItems = listItems && listItems.length >= 0 ? listItems.filter(item=>!item.isDeleted).length : 0
    const checkedItems = listItems && listItems.length >= 0 ? listItems.filter(item=>item.isChecked && !item.isDeleted).length : 0
    const percentage = (checkedItems/totalItems)*100 || 0;


    if (!localStorage.getItem('jwt-token')){
        navigate('/auth');
    }else if (isPageLoading) {
        return <Loading />
    } else if(listData) {
        return ( 
            <div className={styles.viewList}>
                {showEdit ? <EditList close={()=>setShowEdit(false)} online={true} listData={listData} updateData={(newData)=>setListData(newData)} /> : null}
                {showAssignUser && listData.groupId ? <UserSelector close={()=>setShowAssignUser(null)} itemId={showAssignUser} groupId={listData.groupId} selectUser={(userId)=>handleUpdateAssigned(showAssignUser, userId)}/> : null}
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
                        <h2>{listData.name}</h2>
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
                            <p className={styles.createdAt}><IconsLibrary.Calendar />{getDateAndHour(listData.createdAt)}</p>
                            <p className={styles.updatedAt}><IconsLibrary.Sync /> {listData.updatedAt ? getDateAndHour(listData.updatedAt) : getDateAndHour(listData.createdAt)}</p>
                        </div>
                        <p className={styles.description}>{listData.description || "Description was not set for this list."}</p>
                    </div>
                    <div className={styles.listButtons}>
                        
                        {listData.isDeleted ? <button onClick={restoreList}><IconsLibrary.Sync /> Restore List</button> : null}
                        {listData.isDeleted ? null : <button onClick={()=>setShowDeleteModal(true)}><IconsLibrary.Delete /> Delete List</button>}
                        {listData.isDeleted ? null : <button onClick={()=>setShowEdit(true)}><IconsLibrary.Edit /> Edit List</button>}
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
                                .map(item=><GroupListItem showAssignUser={()=>setShowAssignUser(item._id)} groupId={listData.groupId} online={true} updateItemLocally={updateItem} key={item._id} members={members} data={item} />)}
                            {completedItems.length > 0 ? <h3>Completed</h3> : null}
                            {completedItems.map(item=><GroupListItem showAssignUser={()=>setShowAssignUser(item._id)} groupId={listData.groupId} online={true} updateItemLocally={updateItem} key={item._id} members={members} data={item} />)}
                        </>  : 
                            <p className='no-items-text'>No items yet</p>
                    }
                </div>
                {listData._id && members ? <NewItem listId={listData._id} addItemToList={(newItem)=>setListItems(prev=>[...prev, newItem])} online={true} /> : null}
            </div>
        );
    }
    
}
 
export default ViewList;