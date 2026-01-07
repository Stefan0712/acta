import { useNavigate, useParams } from 'react-router-dom';
import styles from './Manage.module.css';
import { useEffect, useState } from 'react';
import { type Group } from '../../../types/models';
import InviteModal from './InviteModal';
import Loading from '../../../components/LoadingSpinner/Loading';
import { deleteGroup, getGroup, leaveGroup } from '../../../services/groupService';
import { useNotifications } from '../../../Notification/NotificationContext';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import { IconsLibrary } from '../../../assets/icons';
import EditGroup from '../../Groups/EditGroup';

const Manage = () => {
    const {groupId} = useParams();

    const navigate = useNavigate();
    const {showNotification} = useNotifications();

    const [showDelete, setShowDelete] = useState(false);
    const [showLeave, setShowLeave] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

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

    const handleLeaveGroup = async () =>{
       if (groupId) {
            try {
                const response = await leaveGroup(groupId);
                if(response){
                    showNotification(response, 'info');
                    navigate('/groups');
                }
            } catch (error) {
                console.error(error);
                showNotification("Failed to leave group.", "error");
                setShowLeave(false);
            }
       }
    }

    const handleDelete = async () => {
        if( groupId ) {
            try {
                const response = await deleteGroup(groupId);
                if(response){
                    navigate('/groups');
                    showNotification("Group deleted!", "success");
                }
            } catch (error) {
                console.error(error)
                showNotification("Failed to delete group", "error");
            }
        }
    }

    if (!groupData) {
        return (
            <Loading />
        )
    } else {
        return ( 
            <div className={styles.manage}>
                {showEdit && groupId ? <EditGroup close={()=>setShowEdit(false)} groupId={groupId} finishGroupEdit={()=>window.location.reload()} /> : null}
                {showDelete ? <ConfirmationModal cancel={()=>setShowDelete(false)} confirm={handleDelete} title='Delete this group?' content='Are you sure you want to delete this group and all items related to it? This cannot be undone'/>  : null}
                {showLeave ? <ConfirmationModal cancel={()=>setShowLeave(false)} confirm={handleLeaveGroup} title='Leave this group?' content='Are you sure you want to leave this group? If you want to rejoin, you must receive another invitation from a group member.'/>  : null}
                {showInviteModal && groupId ? <InviteModal groupId={groupId}  close={()=>setShowInviteModal(false)} /> : null}
                <h4>Members</h4>
                <div className={styles.membersContainer}>
                    {groupData.members?.length > 0 ? groupData.members.map(member=><div className={styles.member} key={member.userId}><p>{member.username}</p><b>{member.role}</b></div>) : <p>No members</p>}
                </div>
                <button className={styles.inviteButton} onClick={()=>setShowInviteModal(true)}>Invite members</button>
                <button className={styles.menuButton} onClick={()=>setShowEdit(true)}><IconsLibrary.Edit /><p>Edit Group</p></button>
                <button className={styles.menuButton} onClick={()=>setShowDelete(true)} style={{color: 'red'}}><IconsLibrary.Delete /><p>Delete Group</p></button>
                <button className={styles.menuButton} onClick={()=>setShowLeave(true)}><IconsLibrary.Logout /><p>Leave Group</p></button>
            </div>
        );
    }
    
}
 
export default Manage;