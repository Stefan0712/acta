import { useMemo, useState } from 'react';
import styles from './Lists.module.css';
import { IconsLibrary } from '../../../assets/icons';
import NewList from '../../../components/NewList/NewList';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/LoadingSpinner/Loading';
import { db } from '../../../db';
import Header from '../../../components/Header/Header';
import Summaries from '../../../components/Summaries/Summaries';
import { useLiveQuery } from 'dexie-react-hooks';
import List from './List';



const Lists = () => {

    const navigate = useNavigate();
    const { groupId } = useParams();

    
    const [showNewList, setShowNewList] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('active');

    
    const lists = useLiveQuery( async () => {
        if (groupId) {
            return await db.lists
                .where('groupId').equals(groupId)
                .reverse()
                .toArray();
        } else {
            return await db.lists
                .filter(list => !list.groupId)
                .reverse()
                .toArray()
        }
    }, [groupId]);

    const filteredLists = useMemo(() => {
        if (!lists) return [];

        return lists.filter(list => {
            switch (selectedFilter) {
                case 'active':
                    return !list.isDeleted;
                case 'deleted':
                    return list.isDeleted === true;
                default:
                    return false;
            }
        });
    }, [lists, selectedFilter]);

    if (!localStorage.getItem('jwt-token') && groupId) {
        navigate('/auth;')
    } else if(!lists) {
        return ( <Loading /> )
    } else if (lists) {
        return ( 
            <div className={styles.lists} style={!groupId ? {gridTemplateRows: 'var(--page-header-height) auto 40px 1fr'} : {}}>
                {!groupId ? 
                    <Header title='My Lists' />
                : null}
                <Summaries totalItems={lists.length} completedItems={lists.filter(list=>list.completedItemsCounter === list.totalItemsCounter && list.completedItemsCounter && list.completedItemsCounter > 0).length} />
                <select className='category-selector' value={selectedFilter} onChange={(e)=>setSelectedFilter(e.target.value)}>
                    <option value={'active'}>Active</option>
                    <option value={'deleted'}>Deleted</option>
                </select>
                <div className={styles.listsContainer}>
                    {showNewList ? <NewList close={()=>setShowNewList(false)} groupId={groupId} /> : null}
                    {showNewList ? null : <button onClick={()=>setShowNewList(true)} className={styles.newListButton}>
                        <IconsLibrary.Plus />
                    </button>}
                    {filteredLists?.length > 0 ? filteredLists.map((list, index)=><List
                        data={list} 
                        key={index} 
                    />) : <p className='no-items-text'>There are no lists.</p>}
                </div>
            </div>
        );
    }
}
    
export default Lists;

