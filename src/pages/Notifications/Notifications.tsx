import { useState } from 'react';
import styles from './Notifications.module.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { type Notification } from '../../types/models';
import { formatRelativeTime } from '../../helpers/dateFormat';

const Notifications = () => {

    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const userId = localStorage.getItem('userId');


    const notifications = useLiveQuery(async ()=>{
        if(!userId) return [];

        const items = await db.notifications.where({recipientId: userId}).toArray();
        return items.sort((a, b)=> b.createdAt.getTime() - a.createdAt.getTime());

    }, [userId]);

 
    return (
        <div className={styles.notifications}>
            <div className={styles.header}>
                <h3>Notifications</h3>
            </div>
            <div className={styles.filters}>
                <div className={styles.buttons}>
                    <button className={selectedCategory === 'all' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('all')}>All</button>
                    <button className={selectedCategory === 'unread' ? styles.selectedCategory : ''} onClick={()=>setSelectedCategory('unread')}>Unread</button>
                </div>
                <fieldset>
                    <label>Group</label>
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

const Notification = ({data} : {data: Notification}) =>{

    return (
        <div className={styles.notification}>
            <div className={styles.color} />
            <div className={styles.content}>
                <b>Notification Type</b>
                <p className={styles.message}>{data.message}</p>
            </div>
            <p className={styles.timestamp}>{formatRelativeTime(data.createdAt ?? new Date())}</p>
        </div>
    )
}
