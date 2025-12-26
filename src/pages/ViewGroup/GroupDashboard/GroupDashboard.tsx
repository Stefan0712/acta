import { Link, useParams } from 'react-router-dom';
import styles from './GroupDashboard.module.css';
import { IconsLibrary } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import { type ActivityLog, type Group } from '../../../types/models';
import { getGroup, getGroupActivity } from '../../../services/groupService';
import Loading from '../../../components/LoadingSpinner/Loading';
import { getDateAndHour } from '../../../helpers/dateFormat';

const GroupDashboard = () => {

    const {groupId} = useParams();

    const [groupData, setGroupData] = useState<Group | null>(null);
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    const getGroupData = async () => {
        if(groupId) {
            try {
                const apiResponse = await getGroup(groupId);
                setGroupData(apiResponse);
                console.log(apiResponse)
            } catch (error) {
                console.error(error);
            }
        }
    }
    
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

    useEffect(()=>{
        if(groupId){
            getLogs();
            getGroupData();
        }
    },[groupId])


    if(!groupData){
        return (
            <Loading />
        )
    } else {
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
                        <p>{groupData.listCount ?? 0} active</p>
                    </Link>
                    <Link to={'notes'}>
                        <div className={styles.buttonName}>
                            <div className={styles.navigationIcon}>
                                <IconsLibrary.Note />
                            </div>
                            <b>Notes</b>
                        </div>
                        <p>{groupData.noteCount ?? 0} Notes</p>
                    </Link>
                    <Link to={'polls'}>
                        <div className={styles.buttonName}>
                            <div className={styles.navigationIcon}>
                                <IconsLibrary.Poll2 />
                            </div>
                            <b>Polls</b>
                        </div>
                        <p>{groupData.pollCount ?? 0} Ongoing</p>
                    </Link>
                    <Link to={'activity'}>
                        <div className={styles.buttonName}>
                            <div className={styles.navigationIcon}>
                                <IconsLibrary.Activity />
                            </div>
                            <b>Activity</b>
                        </div>
                        <p>5 New</p>
                    </Link>
                </div>
                <div className={styles.activity}>
                    <div className={styles.sectionTitle}>
                        <IconsLibrary.Activity />
                        <b>Latest Activity</b>
                    </div>
                   <div className={styles.activityContainer}>
                        {logs && logs.length > 0 ? logs.map((log, index)=><Link to={log.metadata?.listId ? `/group/${groupId}/lists/${log.metadata?.listId}` : `/group/${groupId}`} key={index} className={styles.log}>
                            <div className={styles.logCircle} />
                            <div className={styles.content}>
                                <p className={styles.message}>{log.message}</p>
                                <b>{getDateAndHour(log.createdAt)}</b>
                            </div>
                        </Link>) : <p className='no-items-text'>No activity</p>}
                   </div>
                </div>
            </div>
        )
    }
}


export default GroupDashboard;