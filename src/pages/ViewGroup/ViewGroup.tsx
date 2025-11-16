import { Link, useParams } from 'react-router-dom';
import styles from './ViewGroup.module.css';
import { IconsLibrary } from '../../assets/icons';
import { useEffect, useState } from 'react';
import { type Group } from '../../types/models';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import Notes from './Notes/Notes';
import Manage from './Manage/Manage';
import Lists from './Lists/Lists';


const ViewGroup = () => {

    const {id} = useParams();
    const { showNotification } = useNotifications();

    const [groupData, setGroupData] = useState<Group>();
    const [currentScreen, setCurrentScreen] = useState<"lists" | "notes" | "manage">("lists");


    const getGroupData = async () => {
        if(id) {
            try {
                const response = await db.groups.get(id);
                setGroupData(response);
            } catch (error) {
                console.error(error);
                showNotification("Failed to get group", "error");
            }
        }
    }
    useEffect(()=>{
        if(id){
            getGroupData();
        }
    },[]);


    if(groupData && id) {
        return ( 
            <div className={styles.viewGroup}>
                <div className={styles.header}>
                    <Link to={'/groups'}><IconsLibrary.BackArrow fill='white'/></Link>
                    <h3>{groupData.name}</h3>
                    <button className={styles.optionsButton}><IconsLibrary.Dots stroke='white'/></button>
                </div>
                <div className={styles.content}>
                    {
                        currentScreen === "lists" ? <Lists groupId={id} /> :
                        currentScreen === "notes" ? <Notes /> : 
                        currentScreen === "manage" ? <Manage /> :
                        <Lists groupId={id}/>
                    }
                </div>
                <div className={styles.screenSwitcher}>
                    <button className={currentScreen === "lists" ? styles.selected : ""} onClick={()=>setCurrentScreen('lists')}>Lists</button>
                    <button className={currentScreen === "notes" ? styles.selected : ""} onClick={()=>setCurrentScreen('notes')}>Notes</button>
                    <button className={currentScreen === "manage" ? styles.selected : ""} onClick={()=>setCurrentScreen('manage')}>Manage</button>
                </div>
            </div>
        );
    }
    
}
 
export default ViewGroup;
