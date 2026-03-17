import { Link, useParams } from 'react-router-dom';
import styles from './GroupDashboard.module.css';
import { IconsLibrary } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import { type ActivityLog } from '../../../types/models';
import { getGroupActivity } from '../../../services/groupService';
import { formatRelativeTime } from '../../../helpers/dateFormat';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';


const GroupDashboard = () => {

    const {groupId} = useParams();


    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loadingActivity, setLoadingAcvitiy] = useState(true);
  
    const stats = useLiveQuery(async () => {
        if (!groupId) return { lists: 0, notes: 0, polls: 0 };

        const [lists, notes, polls] = await Promise.all([
            db.lists.where('groupId').equals(groupId).count(),
            db.notes.where('groupId').equals(groupId).count(),
            db.polls.where('groupId').equals(groupId).count()
        ]);

        return { lists, notes, polls };
        
    }, [groupId]);

    const {lists, notes, polls} = stats ?? { lists: 0, notes: 0, polls: 0 };
    
    const getLogs = async () =>{
        if(groupId){
            try {
                const activity = await getGroupActivity(groupId);
                if(activity && activity.length > 0){
                    setLogs(activity.filter(item=>item.category === "CONTENT"))
                    setLoadingAcvitiy(false)
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(()=>{
        if(groupId){
            getLogs();
        }
    },[groupId])

    return (
        <div className='h-full w-full flex flex-col gap-2'>
            <div className={styles.activity}>
                <div className={styles.sectionTitle}>
                    <IconsLibrary.Activity />
                    <b>Latest Activity</b>
                </div>
                <div className={styles.activityContainer}>
                    {logs && logs.length > 0 ? logs.map((log, index)=><Link to={log.metadata?.listId ? `/group/${groupId}/lists/${log.metadata?.listId}` : `/group/${groupId}`} key={index} className={styles.log}>
                        <div className={styles.content}>
                            <p className={styles.message}>{log.message}</p>
                            <b><IconsLibrary.Time /> {formatRelativeTime(log.createdAt)}</b>
                        </div>
                    </Link>) : <p className='no-items-text'>{loadingActivity ? "Loading acvitiy" : "No activity to show"}</p>}
                </div>
            </div>
        </div>
    )
    
}


export default GroupDashboard;