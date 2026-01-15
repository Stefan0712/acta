import { Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './ViewGroup.module.css';
import { IconsLibrary } from '../../assets/icons';
import Loading from '../../components/LoadingSpinner/Loading';
import Header from '../../components/Header/Header';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

const ViewGroup = () => {

    const {groupId} = useParams();
    const userToken = localStorage.getItem('jwt-token');
    const navigate = useNavigate();

    const groupData = useLiveQuery(async () => {
        if (groupId) {
            const data = await db.groups.get(groupId);
            console.log(data)
            return data;
        }
    }, [groupId])



    if(!userToken){
       navigate('/auth');
    } else if (!groupData) {
        return ( <Loading /> )
    }else if(groupData && groupId) {
        return ( 
            <div className={styles.viewGroup}>
                <Header 
                    title={groupData.name ?? 'View Group'}
                    Button={<button onClick={()=>navigate('./activity')}><IconsLibrary.Activity /></button>}
                />
                <div className={styles.content}>
                    <Outlet context={{members: groupData.members, lists: groupData.listCount, notes: groupData.notesCount, polls: groupData.pollCount}} />
                </div>
            </div>
        );
    }
    
}
 
export default ViewGroup;

