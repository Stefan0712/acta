import { useEffect, useMemo, useState } from 'react';
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
    const [selectedFilter, setSelectedFilter] = useState('active');
    
    useEffect(()=>{
        getLists();
    },[]);

    const getLists = async () => {
        try {
            const response = await db.shoppingLists.toArray();
            if(response && response.length > 0){
                getAllItems(response);
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get lists.", "error");
        }
    };
    const getAllItems = async (fetchedLists: ShoppingList[]) => {
        try {
            const response: ShoppingListItem[] = await db.shoppingListItems.toArray();
            if(response && response.length > 0){
                const updatedLists: ShoppingList[] = fetchedLists.map((list)=>(
                    {
                        ...list, 
                        totalItemsCounter: response.filter(item=>item.listId === list._id && !item.isDeleted).length, 
                        completedItemsCounter: response.filter(item=>item.listId === list._id && item.isChecked && !item.isDeleted).length
                    }
                )
                )
                setLists(updatedLists);
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get all items.", "error");
        }
    };

    const filteredLists = useMemo(() => {
        if (!lists) return [];

        return lists.filter(list => {
            const isListCompleted = list.completedItemsCounter === list.totalItemsCounter && list.totalItemsCounter !== undefined && list.totalItemsCounter > 0;
            switch (selectedFilter) {
                case 'active':
                    return !list.isDeleted && !isListCompleted;
                case 'completed':
                    return !list.isDeleted && isListCompleted;
                
                case 'deleted':
                    return list.isDeleted === true;
                default:
                    return false;
            }
        });
    }, [lists, selectedFilter]);
    // const restoreList = async (listId: string) =>{
    //     try {
    //         await db.shoppingLists.update(listId, {isDeleted: false});
    //         showNotification("Shopping list restored", "success");
    //         navigate('/');
    //     } catch (error) {
    //         console.error(error);
    //         showNotification("Failed to restore list.", "error");
    //     }
    // }

    return ( 
         <div className={styles.lists}>
            <div className={styles.header}>
                    <button onClick={()=>navigate(-1)}><IconsLibrary.BackArrow fill='white'/></button>
                    <h3>My Lists</h3>
                    <button><IconsLibrary.Bell /></button>
                </div>
            <div className={styles.filters}>
                <button onClick={()=>setSelectedFilter('active')} className={selectedFilter === 'active' ? styles.selectedFilter : ''}>Active</button>
                <button onClick={()=>setSelectedFilter('completed')} className={selectedFilter === 'completed' ? styles.selectedFilter : ''}>Completed</button>
                <button onClick={()=>setSelectedFilter('deleted')} className={selectedFilter === 'deleted' ? styles.selectedFilter : ''}>Deleted</button>
            </div>
            <div className={styles.listsContainer}>
                {showNewList ? <NewShoppingList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} /> : null}
                {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                    <IconsLibrary.Plus />
                </button>}
                {filteredLists?.length > 0 ? filteredLists.map(list=><List data={list} />) : <p className='no-items-text'>There are no lists.</p>}
            </div>
        </div>
     );
}
 
export default ShoppingLists;

interface ListProps {
    data: ShoppingList;
    restoreList?: () => void;
}

const List: React.FC<ListProps> = ({data, restoreList}) => {
    return (
         <div className={styles.list}>
            <Link to={`/list/${data._id}`} className={styles.listInfo}>
                <h3>{data.name}</h3>
                {data.description ? <p className={styles.listDescription}>{data.description}</p> : null }    
                <div className={styles.listProgress}>
                    <div className={styles.progressBarBackground}>
                        <div className={styles.progressBar} style={{backgroundColor: data.color, width: data?.totalItemsCounter === 0 ? '0px' : `${((data.completedItemsCounter ?? 0)/(data.totalItemsCounter ?? 0))*100}%`}} />
                    </div>
                    <b>{data.completedItemsCounter}/{data.totalItemsCounter}</b>
                </div>
            </Link>
            {data.isDeleted ? <div className={styles.deleteButtons}>
                <button onClick={()=>console.log("permanently deleted this")}><IconsLibrary.Delete />Permanently Delete</button>
                <button onClick={restoreList}><IconsLibrary.Undo />Restore</button>
            </div> : null}
        </div>
    )
}



