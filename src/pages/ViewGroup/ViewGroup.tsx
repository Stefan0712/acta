import { Link, Outlet, useParams } from 'react-router-dom';
import styles from './ViewGroup.module.css';
import { IconsLibrary } from '../../assets/icons';
import { useEffect, useState } from 'react';
import { type Group } from '../../types/models';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';

const ViewGroup = () => {

    const {groupId} = useParams();
    const { showNotification } = useNotifications();

    const [groupData, setGroupData] = useState<Group>();
    const [currentScreen, setCurrentScreen] = useState<"lists" | "notes" | "manage">("lists");


    const getGroupData = async () => {
        if(groupId) {
            try {
                const response = await db.groups.get(groupId);
                setGroupData(response);
            } catch (error) {
                console.error(error);
                showNotification("Failed to get group", "error");
            }
        }
    }
    useEffect(()=>{
        if(groupId){
            getGroupData();
        }
    },[]);


    if(groupData && groupId) {
        return ( 
            <div className={styles.viewGroup}>
                <div className={styles.header}>
                    <Link to={'/groups'}><IconsLibrary.BackArrow fill='white'/></Link>
                    <h3>{groupData.name}</h3>
                </div>
                <div className={styles.content}>
                    <Outlet />
                </div>
                <div className={styles.screenSwitcher}>
                    <Link to={'/lists'} className={currentScreen === "lists" ? styles.selected : ""} onClick={()=>setCurrentScreen('lists')}>Lists</Link>
                    <button className={currentScreen === "notes" ? styles.selected : ""} onClick={()=>setCurrentScreen('notes')}>Notes</button>
                    <button className={currentScreen === "manage" ? styles.selected : ""} onClick={()=>setCurrentScreen('manage')}>Manage</button>
                </div>
            </div>
        );
    }
    
}
 
export default ViewGroup;
