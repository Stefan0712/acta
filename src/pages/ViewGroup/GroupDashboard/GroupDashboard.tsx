import { Link, useParams } from 'react-router-dom';
import styles from './GroupDashboard.module.css';
import { IconsLibrary } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import { type Group } from '../../../types/models';
import { getGroup } from '../../../services/groupService';
import Loading from '../../../components/LoadingSpinner/Loading';

const GroupDashboard = () => {

    const {groupId} = useParams();

    const [groupData, setGroupData] = useState<Group | null>(null);

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

    useEffect(()=>{
        getGroupData();
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
                <div className={styles.dueSoon}>
                    <div className={styles.sectionTitle}>
                        <IconsLibrary.Time />
                        <b>DUE SOON</b>
                    </div>
                    <div className={styles.dueItem}>
                        <div className={styles.color}></div>
                        <div className={styles.itemInfo}>
                            <b>Buy Charcoal</b>
                            <p>Camping Supplies</p>
                        </div>
                        <div className={styles.due}>Today</div>
                    </div>
                    <p className={styles.noDueItems}>No due items</p>
                </div>
            </div>
        )
    }
}


export default GroupDashboard;