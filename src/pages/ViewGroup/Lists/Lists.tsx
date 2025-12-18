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
                <div className={styles.filters}>
                    <button onClick={()=>setSelectedFilter('active')} className={selectedFilter === 'active' ? styles.selectedFilter : ''}>Active</button>
                    <button onClick={()=>setSelectedFilter('completed')} className={selectedFilter === 'completed' ? styles.selectedFilter : ''}>Completed</button>
                    <button onClick={()=>setSelectedFilter('deleted')} className={selectedFilter === 'deleted' ? styles.selectedFilter : ''}>Deleted</button>
                </div>
                <div className={styles.listsContainer}>
                    {showNewList ? <NewList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} groupId={groupId} /> : null}
                    {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                        <IconsLibrary.Plus />
                    </button>}
                    {filteredLists?.length > 0 ? filteredLists.map((list, index)=><List data={list} key={index} />) : <p className='no-items-text'>There are no lists.</p>}
                </div>
            </div>
        );
    }
}
    

 
export default Lists;

interface ListProps {
    data: ShoppingList;
}

const List: React.FC<ListProps> = ({data}) => {
    const {showNotification} = useNotifications();

    const restoreList = async () =>{
        if(data._id) {
            try {
                await updateList(data._id, {isDeleted: false});
                showNotification("List restored", "success");
            } catch (error) {
                console.error(error);
                showNotification("Failed to restore list.", "error");
            }
        }
    }
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
    return (
        <div className={styles.list}>
            <div className={styles.listInfo}>
                 <Link to={`${data._id}`}>{data.name}</Link>
                {data.description ? <p className={styles.listDescription}>{data.description}</p> : null }    
                {data.totalItemsCounter && data.totalItemsCounter > 0 ? <div className={styles.listProgress}>
                    <div className={styles.progressBarBackground}>
                        <div className={styles.progressBar} style={{backgroundColor: data.color, width: data?.totalItemsCounter === 0 ? '0px' : `${((data.completedItemsCounter ?? 0)/(data.totalItemsCounter ?? 0))*100}%`}} />
                    </div>
                    <b>{data.completedItemsCounter}/{data.totalItemsCounter}</b>
                </div> : <p>List is empty</p>}
            </div>
            {data.isDeleted ? <div className={styles.deleteButtons}>
                <button onClick={permanentlyDelete}><IconsLibrary.Delete />Permanently Delete</button>
                <button onClick={restoreList}><IconsLibrary.Undo />Restore</button>
            </div> : null}
        </div>
    )
}