import { useEffect, useState } from 'react';
import styles from './Groups.module.css';
import NewGroup from './NewGroup';
import { type Group } from '../../types/models';
import { useNotifications } from '../../Notification/NotificationContext';
import { IconsLibrary } from '../../assets/icons';
import { Link, useNavigate } from 'react-router-dom';
import Auth from '../Auth/Auth';
import { getMyGroups } from '../../services/groupService';
import Loading from '../../components/LoadingSpinner/Loading';
import { getIcon } from '../../components/IconSelector/iconCollection';


const Groups = () => {
    
    const userToken = localStorage.getItem('jwt-token');
    const { showNotification } = useNotifications();
    const navigate = useNavigate();

    const [showNewGroup, setShowNewGroup] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);

    const [isLoading, setIsLoading] = useState(true);


    const fetchAndSync = async () => {
        if(userToken) {
            try {
                const apiResponse = await getMyGroups();
                setGroups(apiResponse);
                console.log(apiResponse);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                showNotification("Something went wrong!", "error");
            }
        }
    }
    
    useEffect(()=>{
        fetchAndSync();
    }, [userToken])




    if(!userToken) {
        return (<Auth />)
    }else if (isLoading) {
        return (<Loading />)
    } else {
        return ( 
            <div className={styles.groups}>
                {showNewGroup ? <NewGroup close={()=>setShowNewGroup(false)} addGroup={(newGroup)=>setGroups(prev=>[...prev, newGroup])} /> : null}
                {!showNewGroup ? <button className={styles.addButton} onClick={()=>setShowNewGroup(true)}><IconsLibrary.Plus /></button> : null}
                <div className={styles.header}>
                    <button onClick={()=>navigate(-1)}><IconsLibrary.BackArrow fill='white'/></button>
                    <h2>My Groups</h2>
                    <button><IconsLibrary.Bell /></button>
                </div>
                <div className={styles.groupsContainer}>
                    {groups?.length > 0 ? groups.map(item=><Group key={item._id} data={item} />) : <p className={styles.noGroupsText}>You have no groups. Create one or join one.</p>}
                </div>
            </div>
         );
    }
}
 
export default Groups;

const Group = ({data}: {data: Group}) => {
    const Icon = getIcon(data.icon);
    return (
        <Link to={`/group/${data._id}`} className={styles.group}>
            <div className={styles.groupIcon}>
                <Icon />
            </div>
            <div className={styles.groupContent}>
                <h3>{data.name}</h3>
                <div className={styles.metaItems}>
                    <div className={styles.metaItem}>
                        <p>LISTS</p>
                        <b>{data.listCount ?? 0}</b>
                    </div>
                    <div className={styles.metaItem}>
                        <p>NOTES</p>
                        <b>{data.noteCount ?? 0}</b>
                    </div>
                    <div className={styles.metaItem}>
                        <p>POLLS</p>
                        <b>{data.pollCount ?? 0}</b>
                    </div>
                </div>
            </div>
        </Link>
    )
}