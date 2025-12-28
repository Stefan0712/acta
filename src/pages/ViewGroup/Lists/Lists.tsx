import { useEffect, useMemo, useState } from 'react';
import styles from './Lists.module.css';
import type { ShoppingList, ShoppingListItem } from '../../../types/models';
import { IconsLibrary } from '../../../assets/icons';
import NewList from '../../../components/NewList/NewList';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../../Notification/NotificationContext';
import { deleteList, getGroupLists, updateList } from '../../../services/listService';
import Auth from '../../Auth/Auth';
import Loading from '../../../components/LoadingSpinner/Loading';
import { db } from '../../../db';
import { getIcon } from '../../../components/IconSelector/iconCollection';
import Categories from '../../../components/Categories/Categories';


const Lists = () => {
    const { groupId } = useParams();

    const {showNotification} = useNotifications();
    const navigate = useNavigate();


    const [showNewList, setShowNewList] = useState(false);
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('active');
    
    useEffect(()=>{
        getLists();
    },[]);

    const getLists = async () => {
        if (groupId){
            try {
                const apiResponse = await getGroupLists(groupId);
                setLists(apiResponse); 
            } catch (apiError) {
                console.error("API pull failed:", apiError);
                showNotification("Offline or server issue.", "error");
            } finally {
                setIsLoading(false); 
            }
        } else {
            try {
                const response = await db.shoppingLists.toArray();
                if(response && response.length > 0){
                    getAllItems(response);
                }
                setIsLoading(false)
            } catch (error) {
                console.error(error);
                showNotification("Failed to get lists.", "error");
            }
        }
    };
    const getAllItems = async (fetchedLists: ShoppingList[]) => {
        try {
            const response: ShoppingListItem[] = await db.shoppingListItems.toArray();
            if(response){
                const updatedLists: ShoppingList[] = fetchedLists.map((list)=>(
                    {
                        ...list, 
                        totalItemsCounter: response.filter(item=>item.listId === list._id && !item.isDeleted).length, 
                        completedItemsCounter: response.filter(item=>item.listId === list._id && item.isChecked && !item.isDeleted).length
                    }
                )
                )
                console.log(updatedLists)
                setLists(updatedLists);
            } else {
                setLists([]);
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get all items.", "error");
        }
    };
    const filteredLists = useMemo(() => {
        if (!lists) return [];

        return lists.filter(list => {
            const isListCompleted = list.completedItemsCounter === list.totalItemsCounter && list.completedItemsCounter && list.completedItemsCounter > 0;
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

    const restoreListLocally = (id: string) => {
        setLists(prev=>prev.map(item=>item._id === id ? {...item, isDeleted: false} : item))
    }

    if (!localStorage.getItem('jwt-token') && groupId) {
        return ( <Auth /> )
    } else if(isLoading) {
        return ( <Loading /> )
    } else if (lists) {
        return ( 
            <div className={styles.lists} style={!groupId ? {gridTemplateRows: 'var(--page-header-height) 40px 1fr'} : {}}>
                {!groupId ? 
                    <div className={styles.header}>
                        <button onClick={()=>navigate(-1)}><IconsLibrary.BackArrow fill='white'/></button>
                        <h3>My Lists</h3>
                        <button><IconsLibrary.Bell /></button>
                    </div> 
                : null}
                <Categories category={selectedFilter} setCategory={(newCat)=>setSelectedFilter(newCat)} categories={['active','completed','deleted']} />
                <div className={styles.listsContainer}>
                    {showNewList ? <NewList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} groupId={groupId} /> : null}
                    {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                        <IconsLibrary.Plus />
                    </button>}
                    {filteredLists?.length > 0 ? filteredLists.map((list, index)=><List restoreLocally={(id)=>restoreListLocally(id)} data={list} key={index} />) : <p className='no-items-text'>There are no lists.</p>}
                </div>
            </div>
        );
    }
}
    

 
export default Lists;

interface ListProps {
    data: ShoppingList;
    restoreLocally: (id: string) => void;
}

const List: React.FC<ListProps> = ({data, restoreLocally}) => {
    const {showNotification} = useNotifications();

    const restoreList = async () =>{
        if(data._id) {
            if (data.groupId) {
                try {
                    await updateList(data._id, {isDeleted: false});
                    showNotification("Online list was restored", "success");
                    restoreLocally(data._id);
                } catch (error) {
                    console.error(error);
                    showNotification("Failed to restore online list.", "error");
                }
            } else {
                try {
                    await db.shoppingLists.update(data._id, {isDeleted: false});
                    showNotification('Local list was restored!', "success");
                    restoreLocally(data._id);
                } catch (error) {
                    console.error(error);
                    showNotification("Failed to restore local list","error")
                }
            }
        }
    }
    const permanentlyDelete = async () =>{
        if(data._id) {
            try {
                await deleteList(data._id);
                showNotification("List deleted permanently", "success");
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete list.", "error");
            }
        }
    }

    const percentage = data.completedItemsCounter && data.totalItemsCounter && data.completedItemsCounter > 0 && data.totalItemsCounter > 0 ?  ((data.completedItemsCounter ?? 0)/(data.totalItemsCounter ?? 0))*100 : 0;
    const Icon = getIcon(data.icon) ?? <IconsLibrary.List2 />
    return (
        <div className={styles.list}>
            <Link to={`${data._id}`} className={styles.listInfo}>
              
                <div className={styles.listTop}>
                    <div className={styles.iconContainer} style={{backgroundColor: data.color}}>
                        <Icon />
                    </div>
                    <div className={styles.listInfo}>
                        <h3>{data.name}</h3>
                        <p>{data.totalItemsCounter} items</p>
                    </div>
                </div>
                <div className={styles.listProgress}>
                    <div className={styles.progressBarBackground}>
                        <div className={styles.progressBar} style={{backgroundColor: data.color, width: data?.totalItemsCounter === 0 ? '0px' : `${percentage}%`}} />
                    </div>
                    <p>{percentage}%</p>
                </div>
            </Link>
            {data.isDeleted ? <div className={styles.deleteButtons}>
                <button onClick={permanentlyDelete}><IconsLibrary.Delete />Permanently Delete</button>
                <button onClick={restoreList}><IconsLibrary.Undo />Restore</button>
            </div> : null}
        </div>
    )
}