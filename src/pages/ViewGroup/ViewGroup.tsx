import { Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './ViewGroup.module.css';
import { IconsLibrary } from '../../assets/icons';
import { useEffect, useState } from 'react';
import { type Group } from '../../types/models';
import { getGroup } from '../../services/groupService';
import Loading from '../../components/LoadingSpinner/Loading';
import Header from '../../components/Header/Header';

const ViewGroup = () => {

    const {groupId} = useParams();
    const userToken = localStorage.getItem('jwt-token');
    const navigate = useNavigate();


    const [groupData, setGroupData] = useState<Group | null>();
    const [isLoading, setIsLoading] = useState(true);



    const getGroupData = async () => {
        if (!groupId || !userToken) return;
        try {
            // Attempt online fetch
            const onlineGroup = await getGroup(groupId);
            if (onlineGroup) {
                setGroupData(onlineGroup);
                setIsLoading(false);
                return;
            }
        } catch (error) {
            console.error(error)
        }
    };
    useEffect(() => {
        if (groupId) {
            getGroupData();
        }
    }, [groupId]);

    if(!userToken){
       navigate('/auth');
    } else if (isLoading) {
        return ( <Loading /> )
    }else if(groupData && groupId) {
        return ( 
            <div className={styles.viewGroup}>
                <Header 
                    title={groupData.name ?? 'View Group'}
                    Button={<button onClick={()=>navigate('./activity')}><IconsLibrary.Activity /></button>}
                />
                <div className={styles.content}>
                    <Outlet context={{members: groupData.members}} />
                </div>
            </div>
        );
    }
    
}
 
export default ViewGroup;

