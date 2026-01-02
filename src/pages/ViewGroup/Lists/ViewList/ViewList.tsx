import { useEffect, useMemo, useState } from 'react';
import styles from './ViewList.module.css';
import { type ListItem as ItemType, type List as IList } from '../../../../types/models';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useNotifications } from '../../../../Notification/NotificationContext';
import NewItem from '../../../../components/NewItem/NewItem';
import { getDateAndHour } from '../../../../helpers/dateFormat.ts';
import EditList from '../../../../components/EditList/EditList';
import GroupListItem from '../GroupListItem/GroupListItem.tsx'
import {  getList, updateList } from '../../../../services/listService.ts';
import { getListItems } from '../../../../services/itemService.ts';
import Loading from '../../../../components/LoadingSpinner/Loading.tsx';
import Categories from '../../../../components/Categories/Categories.tsx';
import { IconsLibrary } from '../../../../assets/icons.ts';
import Summaries from '../../../../components/Summaries/Summaries.tsx';



const ViewList = () => {

    const {listId} = useParams();
    const {members} = useOutletContext();
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const { showNotification } = useNotifications();


    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [listData, setListData] = useState<IList | null>(null);
    const [listItems, setListItems] = useState<ItemType[]>([]);

    const [showMore, setShowMore] = useState(false);

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
                    console.log(listItemsResponse)
                } else {
                    showNotification('No list data found', "error");
                }
            } catch (error) {
                console.error("Failed to fetch page data:" , error);
                showNotification("Error loading list", "error")
            }
        }
    };


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
    // Optimistically update item list
    const updateItem = (updatedItem: ItemType) => {
        const updatedList = listItems.map(item=>item._id===updatedItem._id ? updatedItem : item)
        setListItems(updatedList); // Updates the list of all items with the updated one
    };
    if (!localStorage.getItem('jwt-token')){
        navigate('/auth');
    }else if (isPageLoading) {
        return <Loading />
    } else if(listData) {
        return ( 
            <div className={styles.viewList}>
                {showEdit ? <EditList close={()=>setShowEdit(false)} online={true} listData={listData} updateData={(newData)=>setListData(newData)} /> : null}
                <div className={styles.listMeta}>
                    <div className={styles.listName}>
                        <h2>{listData.name}</h2>
                        {listData.isDeleted ? <button onClick={restoreList}><IconsLibrary.Sync /></button> : <button onClick={()=>setShowEdit(true)}><IconsLibrary.Edit /></button>}
                    </div>
                    {showMore ? <>
                        <p className={styles.createdAt}>Created at {getDateAndHour(listData.createdAt)}</p>
                        <p>{listData.description}</p>
                        <Summaries 
                            totalItems={listItems && listItems.length >= 0 ? listItems.filter(item=>!item.isDeleted).length : 0} 
                            completedItems={listItems && listItems.length >= 0 ? listItems.filter(item=>item.isChecked && !item.isDeleted).length : 0}
                        />
                    </> : null}
                    <button className={styles.showMoreButton} onClick={()=>setShowMore(prev=>!prev)}>{showMore ? 'Show less' : 'Show more'}</button>
                </div>
                <Categories category={selectedCategory} setCategory={(newCat)=>setSelectedCategory(newCat)} categories={['all','pinned','mine', 'deleted']} />
                <div className={styles.listItemsContainer}>
                    { filteredItems && filteredItems.length > 0 ? 
                        <>
                            {uncompletedItems.map(item=><GroupListItem groupId={listData.groupId} online={true} updateItemLocally={updateItem} key={item._id} members={members} data={item} />)}
                            {completedItems.length > 0 ? <h3>Completed</h3> : null}
                            {completedItems.map(item=><GroupListItem groupId={listData.groupId} online={true} updateItemLocally={updateItem} key={item._id} members={members} data={item} />)}
                        </>  : 
                            <p className='no-items-text'>No items yet</p>
                    }
                </div>
                <NewItem groupId={listData.groupId} members={members} listId={listData._id} addItemToList={(newItem)=>setListItems(prev=>[...prev, newItem])} online={true} />
            </div>
        );
    }
    
}
 
export default ViewList;