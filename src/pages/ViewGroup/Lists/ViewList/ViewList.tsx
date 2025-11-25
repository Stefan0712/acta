import { useEffect, useMemo, useState } from 'react';
import styles from './ViewList.module.css';
import { type ShoppingListItem as ItemType, type ShoppingList as IShoppingList, type GroupMember } from '../../../../types/models';
import { db } from '../../../../db';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../../../Notification/NotificationContext';
import {IconsLibrary} from '../../../../assets/icons.ts';
import NewShoppingListItem from '../../../../components/NewShoppingListItem/NewShoppingListItem.js';
import { getDateAndHour } from '../../../../helpers/dateFormat.ts';
import EditShoppingList from '../../../../components/EditShoppingList/EditShoppingList.tsx';
import ShoppingListItem from '../GroupListItem/GroupListItem.tsx'



const ViewList = ({ members}: {members?: GroupMember[]}) => {

    const {listId} = useParams();
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const { showNotification } = useNotifications();

    const [showNewItem, setShowNewItem] = useState(false);
    const [showPageMenu, setShowPageMenu] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<"all" | "pinned" | "mine" | "deleted">('all');
    const [listData, setListData] = useState<IShoppingList | null>(null);
    const [listItems, setListItems] = useState<ItemType[]>([]);

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

    useEffect(()=>{
        if (!listId){
            showNotification("No id found", "error");
            return;
        }
        const fetchPageData = async () => {
            try {
                const listDataPromise = db.shoppingLists.get(listId);
                const listItemsPromise = db.shoppingListItems.where('listId').equals(listId).toArray();

                const [listDataResponse, listItemsResponse] = await Promise.all([
                    listDataPromise,
                    listItemsPromise
                ]);
                if (listDataResponse) {
                    setListData(listDataResponse);
                    setListItems(listItemsResponse);
                    console.log(listDataResponse);
                } else {
                    showNotification('No list data found', "error");
                }
            } catch (error) {
                console.error("Failed to fetch page data:" , error);
                showNotification("Error loading list", "error")
            }
        };
        fetchPageData();
    },[listId, showNotification]);

    const deleteList = async () =>{
        try {
            await db.shoppingLists.update(listData?._id, {isDeleted: true});
            showNotification("Shopping list deleted", "success");
            navigate('/');
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete list.", "error");
        }
    }
    const restoreList = async () =>{
        try {
            await db.shoppingLists.update(listData?._id, {isDeleted: false});
            showNotification("Shopping list restored", "success");
            navigate('/');
        } catch (error) {
            console.error(error);
            showNotification("Failed to restore list.", "error");
        }
    }
    // Optimistically update item list
    const updateItem = (updatedItem: ItemType) => {
        const updatedList = listItems.map(item=>item._id===updatedItem._id ? updatedItem : item)
        setListItems(updatedList); // Updates the list of all items with the updated one
    };

    if(listData) {
        return ( 
            <div className={styles.viewList}>
                {showPageMenu ? <PageMenu close={()=>setShowPageMenu(false)} edit={()=>setShowEdit(true)} handleDelete={deleteList} isDeleted={listData.isDeleted} handleRestore={restoreList}/> : null}
                {showEdit ? <EditShoppingList close={()=>setShowEdit(false)} listData={listData} updateData={(newData)=>setListData(newData)} /> : null}
                <div className={styles.listMeta}>
                    <div className={styles.listName}>
                        <h2>{listData.name}</h2>
                        <button onClick={()=>setShowPageMenu(true)}><IconsLibrary.Dots /></button>
                    </div>
                    <p className={styles.createdAt}>Created at {getDateAndHour(listData.createdAt)}</p>
                    <p>{listData.description}</p>
                </div>
                <div className={styles.categoryButtons}>
                    <button className={selectedCategory === 'all' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('all')}>All</button>
                    <button className={selectedCategory === 'pinned' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('pinned')}>Pinned</button>
                    <button className={selectedCategory === 'mine' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('mine')}>Mine</button>
                    <button className={selectedCategory === 'deleted' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('deleted')}>Deleted</button>
                </div>
                <div className={styles.listItemsContainer}>
                    {members && filteredItems && filteredItems.length > 0 ? 
                        <>
                            {uncompletedItems.map(item=><ShoppingListItem members={members} updateItem={updateItem} key={item._id} data={item} />)}
                            {completedItems.length > 0 ? <h3>Completed</h3> : null}
                            {completedItems.map(item=><ShoppingListItem members={members} updateItem={updateItem} key={item._id} data={item} />)}
                        </>  : 
                            <p className={styles.noItemsText}>No items yet</p>
                    }
                </div>
                {showNewItem ? null  : <button onClick={()=>setShowNewItem(true)} className={styles.newItemButton}><IconsLibrary.Plus /></button>}
                {showNewItem ? <NewShoppingListItem members={members} listId={listData._id} addItemToList={(newItem)=>setListItems(prev=>[...prev, newItem])} close={()=>setShowNewItem(false)}/> : null}
            </div>
        );
    }
    
}
 
export default ViewList;


interface PageMenuProps {
    close: () => void;
    edit: () => void;
    handleDelete: () => void;
    handleRestore: () => void;
    isDeleted: boolean;
}

const PageMenu: React.FC<PageMenuProps> = ({close, edit, handleDelete, isDeleted, handleRestore}) => {

    const showEditModal = () => {
        edit();
        close();
    }
    return (
        <div className={styles.pageMenu}>
            <button onClick={showEditModal}>Edit List</button>
            {isDeleted ? <button style={{color: 'var(--text-color)'}} onClick={handleRestore}>Restore List</button> : <button onClick={handleDelete}>Delete List</button>}
            <button onClick={close}>Cancel</button>
        </div>
    )
}
