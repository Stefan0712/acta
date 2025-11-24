import { useEffect, useState } from 'react';
import styles from './Activity.module.css';
import { type ActivityLog } from '../../../types/models';
import { db } from '../../../db';
import { useParams } from 'react-router-dom';
import { useNotifications } from '../../../Notification/NotificationContext';

const Activity = () => {

    const {groupId} = useParams();
    const {showNotification} = useNotifications();

    const [logs, setLogs] = useState<ActivityLog[]>([]);


    const getLogs = async () => {
        if(!groupId) return;
        try {
            const response: ActivityLog[] = await db.activityLogs.where('groupId').equals(groupId).toArray();
            if(response && response.length > 0){
                setLogs(response);
            }
        } catch (error) {
            console.error(error)
            showNotification("There was an error getting group's activity.", "error");
        }
    };
    useEffect(()=>{
        if(groupId){
            getLogs();
        }
    },[groupId]);

    
    return ( 
        <div className={styles.activity}>
            {logs?.length > 0 ? logs.map(item=><p key={item._id}>{item.message}</p>): <p className='no-items-text'>No activity to show</p>}
        </div>
     );
}
 
export default Activity;