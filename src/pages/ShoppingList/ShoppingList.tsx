import { useEffect, useMemo, useState } from 'react';
import styles from './ShoppingList.module.css';
import { type ShoppingListItem as ItemType, type ShoppingList as IShoppingList } from '../../types/models';
import { db } from '../../db';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../Notification/NotificationContext';
import {IconsLibrary} from '../../assets/icons.ts';
import NewShoppingListItem from '../../components/NewShoppingListItem/NewShoppingListItem.js';
import { getDateAndHour } from '../../helpers/dateFormat.ts';
import EditShoppingList from '../../components/EditShoppingList/EditShoppingList.tsx';
import ListItem from '../../components/ListItem/ListItem.tsx';



const ShoppingList = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();

    const [showNewItem, setShowNewItem] = useState(false);
    const [showPageMenu, setShowPageMenu] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [listData, setListData] = useState<IShoppingList | null>(null);
    const [listItems, setListItems] = useState<ItemType[]>([]);

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
                const listDataPromise = db.shoppingLists.get(id);
                const listItemsPromise = db.shoppingListItems.where('listId').equals(id).toArray();

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

    if(!listData) {
        return (
            <div className={styles.shoppingList}>
                <div className={styles.header}>
                    <Link to={'/'}><IconsLibrary.BackArrow fill='white'/></Link>
                    <h2>View List</h2>
                </div>
            </div>
        )
    } else {
        return ( 
            <div className={styles.shoppingList}>
                {showPageMenu ? <PageMenu close={()=>setShowPageMenu(false)} edit={()=>setShowEdit(true)} handleDelete={deleteList} isDeleted={listData.isDeleted} handleRestore={restoreList}/> : null}
                {showEdit ? <EditShoppingList close={()=>setShowEdit(false)} listData={listData} updateData={(newData)=>setListData(newData)} /> : null}
                <div className={styles.header}>
                    <Link to={'/'}><IconsLibrary.BackArrow fill='white'/></Link>
                    <button className={styles.optionsButton} onClick={()=>setShowPageMenu(prev=>!prev)}><IconsLibrary.Dots stroke='white'/></button>
                </div>
                <div className={styles.listMeta}>
                    <h2>{listData.name}</h2>
                    <p className={styles.createdAt}>Created at {getDateAndHour(listData.createdAt)}</p>
                    <p>{listData.description}</p>
                </div>
                <div className={styles.categoryButtons}>
                    <button className={selectedCategory === 'all' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('all')}>All</button>
                    <button className={selectedCategory === 'pinned' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('pinned')}>Pinned</button>
                    <button className={selectedCategory === 'deleted' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('deleted')}>Deleted</button>
                </div>
                <div className={styles.listItemsContainer}>
                    {filteredItems && filteredItems.length > 0 ? 
                        <>
                            {uncompletedItems.map(item=><ListItem online={false} updateItemLocally={updateItem} key={item._id} data={item} />)}
                            {completedItems.length > 0 ? <h3>Completed</h3> : null}
                            {completedItems.map(item=><ListItem online={false} updateItemLocally={updateItem} key={item._id} data={item} />)}
                        </>  : 
                            <p className={styles.noItemsText}>No items yet</p>
                    }
                </div>
                {showNewItem ? null  : <button onClick={()=>setShowNewItem(true)} className={styles.newItemButton}><IconsLibrary.Plus /></button>}
                {showNewItem ? <NewShoppingListItem local={true} listId={listData._id} addItemToList={(newItem)=>setListItems(prev=>[...prev, newItem])} close={()=>setShowNewItem(false)}/> : null}
            </div>
        );
    }
    
}
 
export default ShoppingList;


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
