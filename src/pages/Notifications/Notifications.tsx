import { useEffect, useState } from 'react';
import styles from './Notifications.module.css';
import {type GroupInvitation, type Notification as INotification} from '../../types/models';
import { formatRelativeTime } from '../../helpers/dateFormat';
import { getNotifications } from '../../helpers/NotificationService';
import { useNotifications } from '../../Notification/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { getInvites } from '../../services/groupService';
import Invite from './Invite';
import Loading from '../../components/LoadingSpinner/Loading';

const Notifications = () => {

    const {showNotification} = useNotifications();

    const [selectedGroup, setSelectedGroup] = useState('');
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [invites, setInvites] = useState<GroupInvitation[]>([]);


    const fetchNotifications = async () => {
        try {
            const apiResponse = await getNotifications();
                setNotifications(apiResponse);
                console.log(apiResponse);
                setIsLoading(false);
        } catch (error) {
            console.error(error);
            showNotification('Failed to fetch new notifications.', "error");
        }
    };
    const fetchInvites = async () => {
        try {
            const invitesResponse = await getInvites();
            console.log(invitesResponse)
            setInvites(invitesResponse);
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(()=> {
        fetchNotifications();
        fetchInvites();
    },[]);

    if (isLoading) return (<Loading />)
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
            <div className={styles.invitesContainer}>
                {invites && invites.length > 0 ? invites.map(item=><Invite key={item._id} data={item} />) : null}
            </div>
            <div className={styles.notificationsContainer}>
                {notifications  && notifications.length > 0 ? notifications.map(item=><Notification data={item} />) : <p className='no-items-text'>No notifications</p>}
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
