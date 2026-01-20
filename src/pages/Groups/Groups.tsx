import { useState } from 'react';
import styles from './Groups.module.css';
import NewGroup from './NewGroup';
import { type Group } from '../../types/models';
import { IconsLibrary } from '../../assets/icons';
import { Link } from 'react-router-dom';
import Loading from '../../components/LoadingSpinner/Loading';
import { getIcon } from '../../components/IconSelector/iconCollection';
import Header from '../../components/Header/Header';
import Auth from '../Auth/Auth';
import { useGroupsWithStats } from '../../helpers/useGroupsWithStats';


const Groups = () => {
    
    const userToken = localStorage.getItem('jwt-token');
    const [showNewGroup, setShowNewGroup] = useState(false);

    const groups = useGroupsWithStats();


    if(!userToken) {
        return (<Auth />)
    }else if (!groups) {
        return (<Loading />)
    } else {
        return ( 
            <div className={styles.groups}>
                {showNewGroup ? <NewGroup close={()=>setShowNewGroup(false)} /> : null}
                <Header title='My Groups' Button={<button onClick={()=>setShowNewGroup(true)}><IconsLibrary.Plus /></button>} />
                <div className={styles.groupsContainer}>
                    {groups?.length > 0 ? groups.map(item=><Group key={item._id} data={item} />) : <p className={styles.noGroupsText}>No groups to show. Create one or join one.</p>}
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
                        <IconsLibrary.List2 />
                        <b>{data.stats.lists ?? 0}</b>
                    </div>
                    <div className={styles.metaItem}>
                        <IconsLibrary.Note />
                        <b>{data.stats.notes ?? 0}</b>
                    </div>
                    <div className={styles.metaItem}>
                        <IconsLibrary.Poll />
                        <b>{data.stats.polls ?? 0}</b>
                    </div>
                </div>
            </div>
            <div className={styles.membersCount}>
                <IconsLibrary.Group />
                <b>{data.members.length ?? 0}</b>
            </div>
        </Link>
    )
}