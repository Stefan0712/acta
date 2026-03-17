import { useMemo, useState } from 'react';
import styles from './Lists.module.css';
import { IconsLibrary } from '../../../assets/icons';
import NewList from '../../../components/NewList/NewList';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/LoadingSpinner/Loading';
import { db } from '../../../db';
import Header from '../../../components/Header/Header';
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
            <div className='w-full h-full grid grid-rows-[auto_auto_1fr] gap-3 p-2'>
                {!groupId ? 
                    <Header title='My Lists' />
                : null}
                <div className='p-1 w-fit ml-2 flex gap-2 items-center'>
                    <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'active' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('active')}>Active</button>
                    <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'deleted' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('deleted')}>Deleted</button>
                </div>
                <div className='w-full h-full flex flex-col gap-2 overflow-y-auto'>
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

