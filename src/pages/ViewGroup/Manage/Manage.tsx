import { useNavigate, useParams } from 'react-router-dom';
import styles from './Manage.module.css';
import { useEffect, useMemo, useState } from 'react';
import { type Group, type GroupMember } from '../../../types/models';
import InviteModal from './InviteModal';
import Loading from '../../../components/LoadingSpinner/Loading';
import { changeRole, deleteGroup, getGroup, kickUser, leaveGroup } from '../../../services/groupService';
import { useNotifications } from '../../../Notification/NotificationContext';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import { IconsLibrary } from '../../../assets/icons';
import EditGroup from '../../Groups/EditGroup';
import { getDateAndHour } from '../../../helpers/dateFormat';
import { UserPlus } from 'lucide-react';

const Manage = () => {
    const {groupId} = useParams();

    const navigate = useNavigate();
    const {showNotification} = useNotifications();

    const [showDelete, setShowDelete] = useState(false);
    const [showLeave, setShowLeave] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [groupData, setGroupData] = useState<Group | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [manageUser, setManageUser] = useState<null | GroupMember>(null);

    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredUsers: GroupMember[] = useMemo(()=>{

        if (!members || members.length === 0) return [];
    
        if (searchQuery.length === 0) {
            return members;
        }
        return members.filter(item => 
            item.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    },[searchQuery, members]);

    const getGroupData = async () => {
        if (groupId) {
            try {
                const response = await getGroup(groupId);
                if(response){
                    setGroupData(response);
                    console.log(response)
                    setMembers(response.members);
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
    const handleUpdateMemberLocally = (newData: GroupMember) => {
        setMembers(prev=>{
            return prev.map(member=>
                member.userId === newData.userId ? newData : member
            )
        })
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
                {manageUser && groupId ? <ManageUser close={()=>setManageUser(null)} member={manageUser} groupId={groupId} updateMember={handleUpdateMemberLocally}  /> : null}

                <div className={styles.groupInfo}>
                    <div className={styles.groupName}>
                        <h1>{groupData.name}</h1>
                        <button onClick={()=>setShowEdit(true)}><IconsLibrary.Edit /></button>
                    </div>
                    {groupData.description !== undefined ? <p className={styles.groupDescription}>{groupData.description}</p> : null}
                    <div className={styles.timestamps}>
                        {groupData.createdAt ? <div className={styles.timestamp}>
                            <IconsLibrary.Calendar />
                            <p>{getDateAndHour(groupData.createdAt)}</p>
                        </div> : null}
                        {groupData.updatedAt ? <div className={styles.timestamp}>
                            <IconsLibrary.Sync />
                            <p>{getDateAndHour(groupData.updatedAt)}</p>
                        </div> : null}
                    </div>
                </div>

                <button className={styles.inviteButton} onClick={()=>setShowInviteModal(true)}><UserPlus /> Invite members</button>
                <input type='text' value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder='Search user' />
                <div className={styles.membersHeader}>
                    <h4>Members</h4>
                </div>
                <div className={styles.membersContainer}>
                    {filteredUsers?.length > 0 ? filteredUsers.map(member=>
                    <div className={styles.member} key={member.userId}>
                        <div className={styles.memberPicture}>
                            {member.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className={styles.userText}>
                            <h2>{member.username || 'No username'}</h2>
                            <b>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</b>
                        </div>
                        <button onClick={()=>setManageUser(member)}>
                            <IconsLibrary.Dots />
                        </button>
                    </div>) : <p>No members</p>}
                </div>
                <div className={styles.dangerZone}>
                    <button className={styles.menuButton} onClick={()=>setShowDelete(true)} style={{backgroundColor: 'red', color: 'white'}}><IconsLibrary.Delete /><p>Delete Group</p></button>
                    <button className={styles.menuButton} onClick={()=>setShowLeave(true)}><IconsLibrary.Logout /><p>Leave Group</p></button>
                </div>
            </div>
        );
    }
    
}
 
export default Manage;


interface IManageUser {
    close: ()=>void;
    member: GroupMember;
    groupId: string;
    updateMember: (newData: GroupMember) => void;
}
const ManageUser: React.FC<IManageUser> = ({close, member, groupId, updateMember}) => {

    const currentUserId = localStorage.getItem('userId');

    const {showNotification} = useNotifications();

    const handleSetRole = async (role: string) => {
        try {
            const apiResponse = await changeRole(groupId, member.userId, role);
            updateMember({...apiResponse, username: member.username});
            showNotification(`${member.username}'s role was set to ${role}`, 'success');
            close();
        } catch (error) {
            console.error(error);
        }
    }
    const handleKick = async () => {
        try {
            await kickUser(groupId, member.userId);
            showNotification(`${member.username} was kicked from the group!`, 'success');
            close();
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className={styles.manageUserBg}>
            <div className={styles.manageUser}>
                <div className={styles.memberDetails}>
                    <div className={styles.memberPicture}>
                        {member.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className={styles.userText}>
                        <h2>{member.username || 'No username'}</h2>
                        <b>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</b>
                    </div>
                </div>
                <h3>Change role</h3>
                <div className={styles.manageButtons}>
                    <button className={`${styles.roleButton} ${member.role === 'member' ? styles.selectedRole : ''}`} onClick={()=>handleSetRole('member')}> <p>Member</p> {member.role === 'member' ? <IconsLibrary.Checkmark /> : null}</button>
                    <button className={`${styles.roleButton} ${member.role === 'moderator' ? styles.selectedRole : ''}`} onClick={()=>handleSetRole('moderator')}> <p>Moderator</p>  {member.role === 'moderator' ? <IconsLibrary.Checkmark /> : null}</button>
                    <button className={`${styles.roleButton} ${member.role === 'admin' ? styles.selectedRole : ''}`} onClick={()=>handleSetRole('admin')}> <p>Admin</p>  {member.role === 'admin' ? <IconsLibrary.Checkmark /> : null}</button>
                    <button className={`${styles.roleButton} ${member.role === 'owner' ? styles.selectedRole : ''}`}> <p>Owner</p>  {member.role === 'owner' ? <IconsLibrary.Checkmark /> : null}</button>
                </div>
                {member.userId !== currentUserId ? <button className={styles.kickButton} onClick={handleKick}>Kick</button> : null}
                <button className={styles.closeButton} onClick={close}>Close</button>
            </div>
        </div>
    )
}