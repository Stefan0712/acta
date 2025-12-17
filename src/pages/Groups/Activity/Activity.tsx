import { useEffect, useState } from 'react';
import styles from './Activity.module.css';
import { type ActivityLog } from '../../../types/models';
import { Link, useParams } from 'react-router-dom';
import { getGroupActivity } from '../../../services/groupService';
import { getDateAndHour } from '../../../helpers/dateFormat';

const Activity = () => {

    const {groupId} = useParams();
    const [filter, setFilter] = useState('all');
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    const getLogs = async () =>{
        console.log(groupId)
        if(groupId){
            try {
                const activity = await getGroupActivity(groupId);
                if(activity && activity.length > 0){
                    setLogs(activity)
                }
            } catch (error) {
                console.error(error);
            }
        }
    };
    console.log(logs)
    useEffect(()=>{
        if(groupId){
            getLogs();
        }
    },[groupId])



    
    return ( 
        <div className={styles.activity}>
            <div className={styles.filters}>
                <button onClick={()=>setFilter('all')} className={filter === 'all' ? styles.selectedFilter : ''}>All</button>
                <button onClick={()=>setFilter('mine')} className={filter === 'mine' ? styles.selectedFilter : ''}>Mine</button>
            </div>
            <div className={styles.logsContainer}>
                {logs && logs.length > 0 ? logs.map((log, index)=><Link to={log.metadata?.listId ? `/group/${groupId}/lists/${log.metadata?.listId}` : `/group/${groupId}`} key={index} className={styles.log}>
                    <div className={styles.logCircle} />
                    <div className={styles.content}>
                        <p className={styles.message}>{log.message}</p>
                        <b>{getDateAndHour(log.createdAt)}</b>
                    </div>
                </Link>) : <p className='no-items-text'>No activity</p>}
            </div>
        </div>
     );
}
 
export default Activity;