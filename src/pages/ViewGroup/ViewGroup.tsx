import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './ViewGroup.module.css';
import { IconsLibrary } from '../../assets/icons';
import { useEffect, useState } from 'react';
import { type Group } from '../../types/models';
import { useNotifications } from '../../Notification/NotificationContext';
import { deleteGroup, getGroup } from '../../services/groupService';
import Loading from '../../components/LoadingSpinner/Loading';
import EditGroup from '../Groups/EditGroup';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const ViewGroup = () => {

    const {groupId} = useParams();
    const userToken = localStorage.getItem('jwt-token');
    const navigate = useNavigate();

    const [groupData, setGroupData] = useState<Group | null>();
    const [isLoading, setIsLoading] = useState(true);

    const [showMenu, setShowMenu] = useState(false);
    const [showEdit, setShowEdit] = useState(false);


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
                {showMenu ? <Menu close={()=>setShowMenu(false)} showEdit={()=>setShowEdit(true)} groupId={groupId} /> : null}
                {showEdit ? <EditGroup groupId={groupId} close={()=>setShowEdit(false)} handleLocalUpdate={(newData)=>setGroupData(newData)}/> : null}    
                <div className={styles.header}>
                    <button onClick={()=>navigate(`/group/${groupData._id}`)}><IconsLibrary.Arrow/></button>
                    <h3>{groupData.name}</h3>
                    <button onClick={()=>setShowMenu(prev=>!prev)}>
                        <IconsLibrary.Settings />
                    </button>
                </div>
                <div className={styles.content}>
                    <Outlet context={{members: groupData.members}} />
                </div>
            </div>
        );
    }
    
}
 
export default ViewGroup;


const Menu = ({close, showEdit, groupId}: {close: ()=> void, showEdit: ()=>void, groupId: string}) => {
    
    const [showDelete, setShowDelete] = useState(false);
    const navigate = useNavigate();
    const {showNotification} = useNotifications();


    const handleLeaveGroup = () =>{
        console.log("Group left")
    }
    const handleEdit = () => {
        showEdit();
        close();
    }
    const handleDelete = async () => {
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
    return (
        <div className={styles.menu}>
            {showDelete ? <ConfirmationModal cancel={()=>setShowDelete(false)} confirm={handleDelete} />  : null}
            <Link to={'manage'} className={styles.menuButton} onClick={()=>close()}><IconsLibrary.Group /><p>Manage Group</p></Link>
            <button className={styles.menuButton} onClick={handleEdit}><IconsLibrary.Edit /><p>Edit Group</p></button>
            <button className={styles.menuButton} onClick={()=>setShowDelete(true)} style={{color: 'red'}}><IconsLibrary.Delete /><p>Delete Group</p></button>
            <button className={styles.menuButton} onClick={handleLeaveGroup}><IconsLibrary.Logout /><p>Leave Group</p></button>
            <button className={styles.menuButton} onClick={close}><IconsLibrary.Close />Close</button>            
        </div>
    )
}
