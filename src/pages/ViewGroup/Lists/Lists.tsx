import { useEffect, useState } from 'react';
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
    const [showDeleted, setShowDeleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
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
    if (!localStorage.getItem('jwt-token')) {
        return ( <Auth /> )
    } else if(isLoading) {
        return ( <Loading /> )
    } else if (lists) {
        return ( 
            <div className={styles.lists}>
                <div className={styles.listsContainer}>
                    {showNewList ? <NewShoppingList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} groupId={groupId} /> : null}
                    {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                        <IconsLibrary.Plus />
                        <b>New List</b>
                    </button>}
                    {lists?.length > 0 ? lists.filter(item=>!item.isDeleted).map((list, index)=><List data={list} key={index} />) : <p className='no-items-text'>There are no lists.</p>}
                    <div className={`${styles.deletedLists} ${showDeleted ? styles.expand : ''}`}>
                        {lists?.length > 0 ? <div className={`${styles.deletedLists} ${showDeleted ? styles.expand : ''}`}>
                            <div className={styles.deletedHeader} onClick={()=>setShowDeleted(prev=>!prev)}>
                                <h4>Deleted</h4>
                                <IconsLibrary.Arrow />
                            </div>
                            {lists.filter(item=>item.isDeleted).map((list, index)=><List updateLists={getLists} data={list} key={index} />) }
                        </div> : null}
                    </div>
                </div>
            </div>
        );
    }
}
    

 
export default Lists;

interface ListProps {
    data: ShoppingList;
    updateLists: ()=>void;
}

const List: React.FC<ListProps> = ({data, updateLists}) => {
    const {showNotification} = useNotifications();

    const restoreList = async () =>{
        if(data._id) {
            try {
                await updateList(data._id, {isDeleted: false});
                updateLists();
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
                updateLists();
                showNotification("List deleted permanently", "success");
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete list.", "error");
            }
        }
    }
    return (
        <div className={styles.list}>
            <Link to={`lists/${data._id}`}>{data.name}</Link>
            {data.isDeleted ? <div className={styles.deleteButtons}>
                <button onClick={permanentlyDelete}><IconsLibrary.Delete />Permanently Delete</button>
                <button onClick={restoreList}><IconsLibrary.Undo />Restore</button>
            </div> : null}
        </div>
    )
}