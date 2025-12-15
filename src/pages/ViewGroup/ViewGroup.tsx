import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './ViewGroup.module.css';
import { IconsLibrary } from '../../assets/icons';
import { useEffect, useState } from 'react';
import { type Group } from '../../types/models';
import { useNotifications } from '../../Notification/NotificationContext';
import { deleteGroup, getGroup } from '../../services/groupService';
import Auth from '../Auth/Auth';
import Loading from '../../components/LoadingSpinner/Loading';
import EditGroup from '../Groups/EditGroup';

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
       return (  <Auth />)
    } else if (isLoading) {
        return ( <Loading /> )
    }else if(groupData && groupId) {
        return ( 
            <div className={styles.viewGroup}>
                {showMenu ? <Menu close={()=>setShowMenu(false)} showEdit={()=>setShowEdit(true)} groupId={groupId} /> : null}
                {showEdit ? <EditGroup groupId={groupId} close={()=>setShowEdit(false)} handleLocalUpdate={(newData)=>setGroupData(newData)}/> : null}    
                <div className={styles.header}>
                    <button onClick={()=>navigate(-1)}><IconsLibrary.BackArrow fill='white'/></button>
                    <h3>{groupData.name}</h3>
                    <button onClick={()=>setShowMenu(prev=>!prev)}>
                        <IconsLibrary.Settings />
                    </button>
                </div>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        );
    }
    
}
 
export default ViewGroup;


const Menu = ({close, showEdit, groupId}: {close: ()=> void, showEdit: ()=>void, groupId: string}) => {
    
    const [showDelete, setShowDelete] = useState(false);
    const handleLeaveGroup = () =>{
        console.log("Group left")
    }
    const handleEdit = () => {
        showEdit();
        close();
    }
    const handleDelete = () => {
        setShowDelete(true);
    }

    return (
        <div className={styles.menu}>
            {showDelete ? <div className={styles.deleteMenu}><DeleteConfirmation close={()=>setShowDelete(false)} groupId={groupId} /> </div>  : null}
            <Link to={'manage'} onClick={()=>close()}><IconsLibrary.Group /><p>Manage Group</p></Link>
            <button onClick={handleEdit}><IconsLibrary.Edit /><p>Edit Group</p></button>
            <button onClick={handleDelete}><IconsLibrary.Delete /><p>Delete Group</p></button>
            <button onClick={handleLeaveGroup}><IconsLibrary.Logout /><p>Leave Group</p></button>
            <button onClick={close}>Close</button>            
        </div>
    )
}


const DeleteConfirmation = ({close, groupId}: {close: ()=> void, groupId: string}) => {

    const navigate = useNavigate();
    const {showNotification} = useNotifications();
    
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
        <div className={styles.deleteConfirmation}>
            <h3>Are you sure?</h3>
            <p>This will permanently delete this group and everything associated with it. This CANNOT be undone!</p>
            <div className={styles.buttons}>
                <button onClick={close}>Cancel</button>
                <button onClick={handleDelete}>Confirm</button>
            </div>
        </div>
    )
}