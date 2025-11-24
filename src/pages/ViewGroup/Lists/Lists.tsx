import { useEffect, useState } from 'react';
import styles from './Lists.module.css';
import type { ShoppingList } from '../../../types/models';
import { db } from '../../../db';
import { IconsLibrary } from '../../../assets/icons';
import NewShoppingList from '../../../components/NewShoppingList/NewShoppingList';
import { Link, useParams } from 'react-router-dom';


const Lists = () => {
    const { groupId } = useParams();
    const [showNewList, setShowNewList] = useState(false);
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    
    useEffect(()=>{
        getLists();
    },[]);

    const getLists = async () => {
        if(groupId){
            const response = await db.shoppingLists.where('groupId').equals(groupId).toArray();
            if(response && response.length > 0){
                setLists(response);
            }
        }
    };

    // TODO: Cache the number of completed items when accessed, by saving them to a redux store or localStorage
    return ( 
        <div className={styles.lists}>
            <div className={styles.listsContainer}>
                {showNewList ? <NewShoppingList close={()=>setShowNewList(false)} addListToState={(newList)=>setLists(prev=>[...prev, newList])} groupId={groupId} /> : null}
                {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                    <IconsLibrary.Plus />
                    <b>New List</b>
                </button>}
                <div className={`${styles.deletedLists} ${showDeleted ? styles.expand : ''}`}>
                    {lists?.length > 0 ? lists.filter(item=>!item.isDeleted).map((list, index)=><List data={list} key={index} />) : <p className='no-items-text'>There are no lists.</p>}
                    {lists?.length > 0 ? <div className={`${styles.deletedLists} ${showDeleted ? styles.expand : ''}`}>
                        <div className={styles.deletedHeader} onClick={()=>setShowDeleted(prev=>!prev)}>
                            <h4>Deleted</h4>
                            <IconsLibrary.Arrow />
                        </div>
                        {lists.filter(item=>item.isDeleted).map((list, index)=><List data={list} key={index} />) }
                    </div> : null}
                </div>
            </div>
        </div>
    );
}
    

 
export default Lists;

interface ListProps {
    data: ShoppingList;
}

const List: React.FC<ListProps> = ({data}) => {
    return (
        <Link to={`lists/${data._id}`} className={styles.list}>
            <b>{data.name}</b>
            {data.isDeleted ? <div className={styles.deleteButtons}>
                <button><IconsLibrary.Delete />Permanently Delete</button>
                <button><IconsLibrary.Undo />Restore</button>
            </div> : null}
        </Link>
    )
}