import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { IconsLibrary } from '../../assets/icons';
import Loading from '../../components/LoadingSpinner/Loading';
import Header from '../../components/Header/Header';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useEffect } from 'react';

const ViewGroup = () => {

    const {groupId} = useParams();
    const userToken = localStorage.getItem('jwt-token');
    const navigate = useNavigate();

    const groupData = useLiveQuery(async () => {
        if (groupId) {
            const data = await db.groups.get(groupId);
            return data;
        }
    }, [groupId])


    const navBtn = 'w-full h-full flex flex-col items-center justify-center text-sm text-white/60 rounded';

    useEffect(()=>{
        if(!userToken){
            navigate('/auth');
        }
    },[])

    if (!groupData) {
        return ( <Loading /> )
    }else if(groupData && groupId) {
        return ( 
            <div className='w-full h-full grid grid-rows-[60px_50px_1fr] gap-4'>
                <Header 
                    title={groupData.name ?? 'View Group'}
                    Button={<button onClick={()=>navigate('./manage')}><IconsLibrary.Dashboard /></button>}
                />
                <div className='w-full h-[50px] grid grid-cols-4 items-center justify-center gap-2 text-white/70 px-2'>
                    <NavLink to={'lists'} className={({ isActive }) => `${navBtn} ${isActive ? 'font-bold text-zinc-900 bg-white/80' : ''}`}>
                        <IconsLibrary.List2 />
                        <b>Lists</b>
                    </NavLink>
                    <NavLink to={'notes'} className={({ isActive }) => `${navBtn} ${isActive ? 'font-bold text-zinc-900 bg-white/80' : ''}`}>
                        <IconsLibrary.Note />
                        <b>Notes</b>
                    </NavLink>
                    <NavLink to={'polls'} className={({ isActive }) => `${navBtn} ${isActive ? 'font-bold text-zinc-900 bg-white/80' : ''}`}>
                        <IconsLibrary.Poll2 />
                        <b>Polls</b>
                    </NavLink>
                    <NavLink to={'manage'} className={({ isActive }) => `${navBtn} ${isActive ? 'font-bold text-zinc-900 bg-white/80' : ''}`}>
                        <IconsLibrary.Settings />
                        <b>Manage</b>
                    </NavLink>
                </div>
                <Outlet context={{members: groupData.members}} />
            </div>
        );
    }
    
}
 
export default ViewGroup;

