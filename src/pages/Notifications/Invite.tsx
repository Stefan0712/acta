import { useState } from 'react';
import { getIcon } from '../../components/IconSelector/iconCollection';
import { formatRelativeTime } from '../../helpers/dateFormat';
import { respondToInvite } from '../../services/groupService';
import type { GroupInvitation } from '../../types/models';
import styles from './Invite.module.css';
import { useNotifications } from '../../Notification/NotificationContext';
import { useNavigate } from 'react-router-dom';


const Invite = ({data}: {data: GroupInvitation}) => {

    const {showNotification} = useNotifications();
    const navigate = useNavigate();

    const [status, setStatus] = useState(data.status);
    const [isLoading, setIsLoading] = useState(false);


    const handleRespondInvite = async (option: string) => {
        setIsLoading(true);
        try {
            await respondToInvite(data._id, option);
            setStatus(option);
            showNotification("Successfully accepted invite!", "success");
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            showNotification("Failed to accept notification. Try again!", "error");
            setIsLoading(false);
        }
    }

    const Icon = getIcon(data.groupId.icon || 'default-icon');
    return (
        <div className={styles.invite}>
            <div className={styles.meta}>
                <div className={styles.iconContainer} style={{backgroundColor: data.groupId.color}}>
                    <Icon />
                </div>
                <div className={styles.metaText}>
                    <h2>{data.groupId.name}</h2>
                    <p className={styles.createdAt}>{formatRelativeTime(data.updatedAt)}</p>
                </div>
                <p className={styles.statusText}>{data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
            </div>
            <div className={styles.status}>
                <p>Sent by {data.senderId.username}</p>
            </div>
            {status === 'pending' ? <div className={styles.buttons}>
                <button style={{color: 'red'}} onClick={()=>handleRespondInvite('decline')}>Decline</button>
                <button onClick={()=>handleRespondInvite('accept')} disabled={isLoading}>{isLoading ? 'Accepting...' : "Accept"}</button>
            </div> : null}
            {status === 'accepted' ? <div className={styles.buttons} style={{gridTemplateColumns: '1fr'}}>
                <button onClick={()=>navigate('/group/'+data.groupId._id)}>Go to group</button>
            </div> : null}
        </div>
    )
}

export default Invite;