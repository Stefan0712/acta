import { useParams } from 'react-router-dom';
import styles from './Manage.module.css';
import { useEffect, useState } from 'react';
import { type Group } from '../../../types/models';
import InviteModal from './InviteModal';
import Loading from '../../../components/LoadingSpinner/Loading';
import { getGroup } from '../../../services/groupService';

const Manage = () => {
    const {groupId} = useParams();
    const [groupData, setGroupData] = useState<Group | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const getGroupData = async () => {
        if (groupId) {
            try {
                const response = await getGroup(groupId);
                if(response){
                    setGroupData(response)
                }
            } catch (error) {
                console.error(error);
            }
        }
    };
    useEffect(()=>{
        if(groupId){
            getGroupData();
        };
    }, [groupId]);

    if (!groupData) {
        return (
            <Loading />
        )
    } else {
        return ( 
            <div className={styles.manage}>
                {showInviteModal && groupId ? <InviteModal groupId={groupId}  close={()=>setShowInviteModal(false)} /> : null}
                <h4>Members</h4>
                <div className={styles.membersContainer}>
                    {groupData.members?.length > 0 ? groupData.members.map(member=><div className={styles.member} key={member.userId}><p>{member.username}</p><b>{member.role}</b></div>) : <p>No members</p>}
                </div>
                <button className={styles.inviteButton} onClick={()=>setShowInviteModal(true)}>Invite members</button>
            </div>
        );
    }
    
}
 
export default Manage;