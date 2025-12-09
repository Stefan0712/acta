import { useEffect, useState } from 'react';
import styles from './ShoppingLists.module.css';
import NewShoppingList from '../../components/NewShoppingList/NewShoppingList';
import { type ShoppingListItem, type ShoppingList } from '../../types/models';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { IconsLibrary } from '../../assets/icons';

// TODO: Make it so when redirecting the user to the list inside a group to also select the View List view.
const ShoppingLists = () => {
    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [showNewList, setShowNewList] = useState(false);
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [allItems, setAllItems] = useState<ShoppingListItem[]>([]);
    
    useEffect(()=>{
        getLists();
        getAllItems();
    },[]);

    const getLists = async () => {
        try {
            const response = await db.shoppingLists.toArray();
            if(response && response.length > 0){
                setLists(response);
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get lists.", "error");
        }
    };
    const getAllItems = async () => {
        try {
            const response = await db.shoppingListItems.toArray();
            if(response && response.length > 0){
                setAllItems(response.filter(item=>!item.isDeleted));
                console.log(response)
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get all items.", "error");
        }
    };

    const restoreList = async (listId: string) =>{
        try {
            await db.shoppingLists.update(listId, {isDeleted: false});
            showNotification("Shopping list restored", "success");
            navigate('/');
        } catch (error) {
            console.error(error);
            showNotification("Failed to restore list.", "error");
        }
    }

    return ( 
        <div className={styles.shoppingLists}>
            {showNewList ? <NewShoppingList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} /> : null}
            <div className={styles.header}>
                <h3>My Lists</h3>
                <button className={styles.addButton} onClick={()=>setShowNewList(true)}>+</button>
            </div>
            <div className={styles.listsContainer}>
                {lists?.length > 0 ? lists.filter(item=>!item.isDeleted).map((list, index)=><List completedItems={allItems.filter(item=>item.listId === list._id && item.isChecked)} allItems={allItems.filter(item=>item.listId === list._id)} data={list} key={index} />) : <p className='no-items-text'>There are no lists.</p>}
                {lists?.length > 0 ? <div className={`${styles.deletedLists} ${showDeleted ? styles.expand : ''}`}>
                    <div className={styles.deletedHeader} onClick={()=>setShowDeleted(prev=>!prev)}>
                        <h4>Deleted</h4>
                        <IconsLibrary.Arrow />
                    </div>
                    {lists.filter(item=>item.isDeleted && !item.groupId).map((list, index)=><List completedItems={allItems.filter(item=>item.listId === list._id && item.isChecked)} allItems={allItems.filter(item=>item.listId === list._id)} data={list} key={index} restoreList={()=>restoreList(list._id)} />) }
                </div> : null}
                
            </div>
        </div>
     );
}
 
export default ShoppingLists;

interface ListProps {
    data: ShoppingList;
    restoreList?: () => void;
    completedItems: ShoppingListItem[];
    allItems: ShoppingListItem[];
}

const List: React.FC<ListProps> = ({data, restoreList, completedItems, allItems}) => {
    return (
        <div className={styles.list}>
            <Link to={data.groupId ? `/group/${data.groupId}/lists/${data._id}` :  `/list/${data._id}`} className={styles.listInfo}>
                <h3>{data.name}</h3>
                {data.description ? <p className={styles.listDescription}>{data.description}</p> : null }    
                {allItems.length < 1 ? <p>List empty</p> : <div className={styles.listProgress}>
                    <div className={styles.progressBarBackground}>
                        <div className={styles.progressBar} style={{backgroundColor: data.color, width: `${(completedItems.length/allItems.length)*100}%`}} />
                    </div>
                    <b>{completedItems.length}/{allItems.length}</b>
                </div>}
            </Link>
            {restoreList ? <button className={styles.restoreButton} onClick={restoreList}><IconsLibrary.Undo /></button> : null}
        </div>
    )
}



