import { useEffect, useState } from 'react';
import styles from './Notifications.module.css';
import { type Notification as INotification} from '../../types/models';
import { formatRelativeTime } from '../../helpers/dateFormat';
import { getNotifications } from '../../helpers/NotificationService';
import { useNotifications } from '../../Notification/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';

const Notifications = () => {

    const {showNotification} = useNotifications();

    const [selectedGroup, setSelectedGroup] = useState('');
    const [notifications, setNotifications] = useState<INotification[]>([]);


    const fetchNotifications = async () => {
        try {
            const apiResponse = await getNotifications();
                setNotifications(apiResponse);
                console.log(apiResponse)
        } catch (error) {
            console.error(error);
            showNotification('Failed to fetch new notifications.', "error")
        }
    };

    useEffect(()=> {
        fetchNotifications();
    },[]);

 
    return (
        <div className={styles.notifications}>
            <Header title='Notifications' />
            <div className={styles.filters}>
                <fieldset>
                    <select value={selectedGroup} onChange={(e)=>setSelectedGroup(e.target.value)}>
                        <option>Group 1</option>
                        <option>Group 2</option>
                    </select>
                </fieldset>
            </div>
            <div className={styles.notificationsContainer}>
                {notifications  && notifications.length > 0 ? notifications.map(item=><Notification data={item} />) : <p>No notifications</p>}
            </div>
        </div>
    )
}


export default Notifications;

const Notification = ({data} : {data: INotification}) =>{

    const navigate = useNavigate();

    return (
        <div className={styles.notification} key={data._id} onClick={()=>data.groupId ? navigate(`/group/${data.groupId}`) : null}>
            <div className={styles.color} />
            <div className={styles.content}>
                <b>{data.category ? `${data.category} update` : ''}</b>
                <p className={styles.message}>{data.message}</p>
            </div>
            <p className={styles.timestamp}>{formatRelativeTime(data.createdAt ?? new Date())}</p>
        </div>
    )
}
