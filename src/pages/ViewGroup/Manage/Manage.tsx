import { useParams } from 'react-router-dom';
import styles from './Manage.module.css';
import { db } from '../../../db';
import { useEffect, useState } from 'react';
import { type Group } from '../../../types/models';
import InviteModal from './InviteModal';

const Manage = () => {
    const {groupId} = useParams();
    const [groupData, setGroupData] = useState<Group | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const getGroupData = async () => {
        try {
            const response = await db.groups.get(groupId);
            if(response){
                setGroupData(response)
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(()=>{
        if(groupId){
            getGroupData();
        };
    }, [groupId]);

    if (!groupData) {
        return (
            <p>Loading</p>
        )
    } else {
        return ( 
            <div className={styles.manage}>
                {groupId}
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