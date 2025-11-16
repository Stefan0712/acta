import { useEffect, useState } from 'react';
import styles from './Lists.module.css';
import type { ShoppingList } from '../../../types/models';
import { useNotifications } from '../../../Notification/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../../db';
import { IconsLibrary } from '../../../assets/icons';
import NewShoppingList from '../../../components/NewShoppingList/NewShoppingList';

interface ListsProps {
    groupId: string;
}
const Lists: React.FC<ListsProps> = ({groupId}) => {

    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [showNewList, setShowNewList] = useState(false);
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    
    useEffect(()=>{
        getLists();
    },[]);

    const getLists = async () => {
        const response = await db.shoppingLists.toArray();
        if(response && response.length > 0){
            setLists(response);
        } else {
            showNotification('No lists found', "error");
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
        <div className={styles.lists}>
            <div className={styles.listsContainer}>
                {showNewList ? <NewShoppingList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} groupId={groupId} /> : null}
                {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                    <IconsLibrary.Plus />
                    <b>New List</b>
                </button>}
                {lists?.length > 0 ? lists.filter(item=>!item.isDeleted).map((list, index)=><List data={list} key={index} />) : <p>No lists</p>}
                <div className={`${styles.deletedLists} ${showDeleted ? styles.expand : ''}`}>
                    <div className={styles.deletedHeader} onClick={()=>setShowDeleted(prev=>!prev)}>
                        <h4>Deleted</h4>
                        <IconsLibrary.Arrow />
                    </div>
                    {lists?.length > 0 ? lists.filter(item=>item.isDeleted).map((list, index)=><List data={list} key={index} restoreList={()=>restoreList(list._id)} />) : <p>No lists</p>}
                </div>
            </div>
        </div>
    );
}
 
export default Lists;

interface ListProps {
    data: ShoppingList;
    restoreList?: () => void;
}

const List: React.FC<ListProps> = ({data, restoreList}) => {
    return (
        <Link to={`/list/${data._id}`} className={styles.list}>
            <b>{data.name}</b>
            <p>3 items</p>
            {restoreList ? <button onClick={restoreList}><IconsLibrary.Undo /></button> : null}
        </Link>
    )
}