import { useEffect, useMemo, useState } from 'react';
import styles from './Lists.module.css';
import type { ShoppingList } from '../../../types/models';
import { IconsLibrary } from '../../../assets/icons';
import NewShoppingList from '../../../components/NewShoppingList/NewShoppingList';
import { Link, useParams } from 'react-router-dom';
import { useNotifications } from '../../../Notification/NotificationContext';
import { deleteList, getGroupLists, updateList } from '../../../services/listService';
import Auth from '../../Auth/Auth';
import Loading from '../../../components/LoadingSpinner/Loading';


const Lists = () => {
    const { groupId } = useParams();
    const {showNotification} = useNotifications();
    const [showNewList, setShowNewList] = useState(false);
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('active');
    
    useEffect(()=>{
        getLists();
    },[groupId]);

    const getLists = async () => {
        if (!groupId) return;
        try {
            const apiResponse = await getGroupLists(groupId);
            console.log(apiResponse)
            setLists(apiResponse); 
        } catch (apiError) {
            console.error("API pull failed:", apiError);
            showNotification("Offline or server issue.", "error");
        } finally {
            setIsLoading(false); 
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


    if (!localStorage.getItem('jwt-token')) {
        return ( <Auth /> )
    } else if(isLoading) {
        return ( <Loading /> )
    } else if (lists) {
        return ( 
            <div className={styles.lists}>
                <div className={styles.filters}>
                    <button onClick={()=>setSelectedFilter('active')} className={selectedFilter === 'active' ? styles.selectedFilter : ''}>Active</button>
                    <button onClick={()=>setSelectedFilter('completed')} className={selectedFilter === 'completed' ? styles.selectedFilter : ''}>Completed</button>
                    <button onClick={()=>setSelectedFilter('deleted')} className={selectedFilter === 'deleted' ? styles.selectedFilter : ''}>Deleted</button>
                </div>
                <div className={styles.listsContainer}>
                    {showNewList ? <NewShoppingList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} groupId={groupId} /> : null}
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