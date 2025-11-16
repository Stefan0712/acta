import { useEffect, useState } from 'react';
import styles from './Groups.module.css';
import NewGroup from './NewGroup';
import { type Group } from '../../types/models';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { IconsLibrary } from '../../assets/icons';
import { Link } from 'react-router-dom';


const Groups = () => {
    
    const userId = localStorage.getItem('userId');
    const { showNotification } = useNotifications();

    const [showNewGroup, setShowNewGroup] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);



    const getGroups = async () =>{
        if(userId) {
            try {
                const response = await db.groups.toArray();
                setGroups(response);
            } catch (error) {
                console.error(error);
                showNotification("Failed to get groups", "error");
            }
        }
    }

    useEffect(()=>{
        if(userId) {
            getGroups();
        }
    }, []);

    return ( 
        <div className={styles.groups}>
            {showNewGroup ? <NewGroup close={()=>setShowNewGroup(false)} addGroup={(newGroup)=>setGroups(prev=>[...prev, newGroup])} /> : null}
            <div className={styles.header}>
                <h2>My Groups</h2>
                <button className={styles.addButton} onClick={()=>setShowNewGroup(true)}><IconsLibrary.Plus /></button>
            </div>
            <div className={styles.groupsContainer}>
                {groups?.length > 0 ? groups.map(item=><Group key={item._id} data={item} />) : <p className={styles.noGroupsText}>You have no groups. Create one or join one.</p>}
            </div>
        </div>
     );
}
 
export default Groups;

const Group = ({data}: {data: Group}) => {

    return (
        <Link to={`/group/${data._id}`} className={styles.group}>
            <h3>{data.name}</h3>
            <div className={styles.membersCount}>
                <IconsLibrary.Group />
                <b>{data.members.length}</b>
            </div>
        </Link>
    )
}