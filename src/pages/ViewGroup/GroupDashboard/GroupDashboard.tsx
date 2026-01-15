import { Link, useOutletContext, useParams } from 'react-router-dom';
import styles from './GroupDashboard.module.css';
import { IconsLibrary } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import { type ActivityLog } from '../../../types/models';
import { getGroupActivity } from '../../../services/groupService';
import { formatRelativeTime } from '../../../helpers/dateFormat';
import { useNotifications } from '../../../Notification/NotificationContext';

interface GroupOutletContext {
    lists: number;
    notes: number;
    polls: number;
}
const GroupDashboard = () => {

    const {groupId} = useParams();
    const {lists, notes, polls} = useOutletContext<GroupOutletContext>();
    const {showNotification} = useNotifications();

    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loadingActivity, setLoadingAcvitiy] = useState(true)
    
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
                showNotification("Failed to get group activity", "error")
            }
        }
    };

    useEffect(()=>{
        if(groupId){
            getLogs();
        }
    },[groupId])

    return (
        <div className={styles.groupDashboard}>
            <div className={styles.groupNavigation}>
                <Link to={'lists'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.List2 />
                        </div>
                        <b>Lists</b>
                    </div>
                    <p>{lists ?? 0} active</p>
                </Link>
                <Link to={'notes'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.Note />
                        </div>
                        <b>Notes</b>
                    </div>
                    <p>{notes ?? 0} Notes</p>
                </Link>
                <Link to={'polls'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.Poll2 />
                        </div>
                        <b>Polls</b>
                    </div>
                    <p>{polls ?? 0} Ongoing</p>
                </Link>
                <Link to={'manage'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.Settings />
                        </div>
                        <b>Manage</b>
                    </div>
                    <p>Group settings</p>
                </Link>
            </div>
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