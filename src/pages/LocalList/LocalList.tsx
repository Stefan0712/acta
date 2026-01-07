import { useEffect, useMemo, useState } from 'react';
import styles from './LocalList.module.css';
import { type ListItem as ItemType, type List as IList } from '../../types/models.ts';
import { db } from '../../db.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../Notification/NotificationContext.tsx';
import {IconsLibrary} from '../../assets/icons.ts';
import NewListItem from '../../components/NewItem/NewItem.js';
import { getDateAndHour } from '../../helpers/dateFormat.ts';
import EditList from '../../components/EditList/EditList.tsx';
import ListItem from '../../components/ListItem/ListItem.tsx';
import Loading from '../../components/LoadingSpinner/Loading.tsx';
import Header from '../../components/Header/Header.tsx';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal.tsx';
import Summaries from '../../components/Summaries/Summaries.tsx';



const List = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();

    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [listData, setListData] = useState<IList | null>(null);
    const [listItems, setListItems] = useState<ItemType[]>([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showMore, setShowMore] = useState(false);

    // Filter items based on the current category
    const filteredItems = useMemo(() => {
        if(selectedCategory === 'all'){
            return listItems.filter(item=>!item.isDeleted);
        }else if(selectedCategory === 'pinned') {
            return listItems.filter(item=>item.isPinned && !item.isDeleted);
        }else if(selectedCategory === 'deleted') {
            return listItems.filter(item=>item.isDeleted);
        }
        return [];
    }, [listItems, selectedCategory]);

    // Filter filtered items into completed and uncompleted
    const uncompletedItems = useMemo(()=> {
        return filteredItems.filter(item => !item.isChecked);
    },[filteredItems]);

    const completedItems = useMemo(()=> {
        return filteredItems.filter(item => item.isChecked);
    },[filteredItems]);

    useEffect(()=>{
        if (!id){
            showNotification("No id found in the url", "error");
            return;
        }
        const fetchPageData = async () => {
            try {
                const listDataPromise = db.lists.get(id);
                const listItemsPromise = db.listItems.where('listId').equals(id).toArray();

                const [listDataResponse, listItemsResponse] = await Promise.all([
                    listDataPromise,
                    listItemsPromise
                ]);
                if (listDataResponse) {
                    setListData(listDataResponse);
                    setListItems(listItemsResponse);
                } else {
                    showNotification('No list data found', "error");
                }
            } catch (error) {
                console.error("Failed to fetch page data:" , error);
                showNotification("Error loading list", "error")
            }
        };
        fetchPageData();
    },[id, showNotification]);

    const deleteList = async () =>{
        try {
            await db.lists.update(listData?._id, {isDeleted: true});
            showNotification("List deleted", "success");
            navigate('/lists');
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete list.", "error");
        }
    }
    const restoreList = async () =>{
        try {
            await db.lists.update(listData?._id, {isDeleted: false});
            showNotification("List restored", "success");
            navigate('/');
        } catch (error) {
            console.error(error);
            showNotification("Failed to restore list.", "error");
        }
    }
    // Optimistically update item list
    const updateItem = (updatedItem: ItemType) => {
        const updatedList = listItems.map(item=>item._id===updatedItem._id ? updatedItem : item);
        setListItems(updatedList);
    };

    if(!listData) {
        return (
           <Loading />
        )
    } else if(listData && listData._id) {
        return ( 
            <div className={styles.List}>
                {showEdit ? <EditList close={()=>setShowEdit(false)} listData={listData} updateData={(newData)=>setListData(newData)} /> : null}
                {showDeleteModal ? <ConfirmationModal cancel={()=>setShowDeleteModal(false)}  confirm={deleteList} title='Delete this list?' content='Are you sure you want to delete this list? You can restore it later' /> : null}
                <Header 
                    prevUrl={'/lists'} 
                    title={listData.name} 
                />
                <div className={styles.listInfo}>
                    <Summaries 
                        totalItems={listItems && listItems.length >= 0 ? listItems.filter(item=>!item.isDeleted).length : 0} 
                        completedItems={listItems && listItems.length >= 0 ? listItems.filter(item=>item.isChecked && !item.isDeleted).length : 0}
                    />
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
                        <option value={'deleted'}>Deleted</option>
                    </select>
                    <div className={styles.buttons}>
                        <button className={styles.showMoreButton} onClick={()=>setShowMore(prev=>!prev)}><IconsLibrary.Arrow style={showMore ? {transform: 'rotateZ(90deg)'} : {transform: 'rotateZ(-90deg)'} } />{showMore ? 'Show less' : 'Show more'}</button>
                    </div>
                </div>
                <div className={styles.listItemsContainer}>
                    {filteredItems && filteredItems.length > 0 ? 
                        <>
                            {uncompletedItems
                            .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
                            .map(item=><ListItem online={false} updateItemLocally={updateItem} key={item._id} data={item} />)}
                            {completedItems.length > 0 ? <h3 className={styles.sectionTitle}>Completed</h3> : null}
                            {completedItems.map(item=><ListItem online={false} updateItemLocally={updateItem} key={item._id} data={item} />)}
                        </>  : 
                            <p className='no-items-text'>No items yet</p>
                    }
                </div>
                <NewListItem listId={listData._id} addItemToList={(newItem)=>setListItems(prev=>[...prev, newItem])} />
            </div>
        );
    }
    
}
 
export default List;
