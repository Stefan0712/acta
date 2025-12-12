import { useEffect, useState } from 'react';
import styles from './NewGroup.module.css';
import type { Group } from '../../types/models';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import { getGroup, updateGroup } from '../../services/groupService';
import Loading from '../../components/LoadingSpinner/Loading';


// TODO: Input validation
const EditGroup = ({close, groupId, handleLocalUpdate}: {close: ()=>void, groupId: string, handleLocalUpdate: (newGroup: Group) => void}) => {

    const { showNotification } = useNotifications();

    const [groupData, setGroupData] = useState<Group | null>(null)
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false)

    const token = localStorage.getItem('jwt-token');

    const handleEditGroup = async () => {

        if(groupData && token){
            const newGroup = {
                name: name,
                description,
                updatedAt: new Date().toISOString(),
            }
            setIsCreating(true);
            try {
                const groupResponse = await updateGroup({...newGroup, _id: groupData._id});
                if(groupResponse){
                    handleLocalUpdate(groupResponse)
                    showNotification("Group created successfully", "success");
                    close();
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCreating(false)
            }
        }
    }

    const getGroupData = async () =>{
        if(groupId && token) {
            try {
                const response = await getGroup(groupId);
                if(response){
                    setGroupData(response);
                    setName(response.name)
                    setDescription(response.description ?? '');
                }
            } catch (error) {
                console.error(error)
                showNotification("Failed to get group data", 'error')
            }
        }
    };

    useEffect(()=>{
        if(groupId){
            getGroupData()
        }
    },[groupId]);

    if(!groupData) {
        return (
            <Loading />
        )
    } else {
        return ( 
            <div className={styles.newGroup}>
                <div className={styles.content}>
                    <h3>Edit Group</h3>
                    <fieldset>
                        <label>Group Name</label>
                        <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} required minLength={0} placeholder='My Group' />
                    </fieldset>
                    <fieldset>
                        <label>Description</label>
                        <input type='text' name='description' onChange={(e)=>setDescription(e.target.value)} value={description} minLength={0} placeholder='Write something about your group here...' />
                    </fieldset>
                    <div className={styles.buttons}>
                        <button onClick={close}>Close</button>
                        <button onClick={handleEditGroup} disabled={isCreating}>{isCreating ? 'Saving...' : 'Save'}</button>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default EditGroup;