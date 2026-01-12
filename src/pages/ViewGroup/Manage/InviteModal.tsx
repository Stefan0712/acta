import { useState } from 'react';
import { IconsLibrary } from '../../../assets/icons';
import styles from './Manage.module.css';
import { generateInviteToken } from '../../../services/groupService';
import { useNotifications } from '../../../Notification/NotificationContext';
import { Send } from 'lucide-react';

const InviteModal = ( {groupId}: {groupId: string}) => {

    const {showNotification} = useNotifications();

    const [inviteLink, setInviteLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [username, setUsername] = useState('');

    const generateLink = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { token } = await generateInviteToken(groupId);
            const fullLink = `192.168.178.47:5173/#/invite?token=${token}`;
            setInviteLink(fullLink);
        } catch (err: any) {
            console.error("Link Generation Error:", err);
            setError(err.message || 'Could not generate invite link.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        showNotification('Link copied to clipboard!', 'success'); 
    };

    const handleSendInvite = async () => {
        showNotification("Notification sent!", "success");
    }
    return (
        <div className={styles.inviteModal}>
            <div className={styles.inviteByUsername}>
                <input 
                    name='username' 
                    type='text'
                    onChange={(e)=>setUsername(e.target.value)}
                    value={username}
                    placeholder='Enter username...'
                    minLength={0}
                />
                <button 
                    onClick={handleSendInvite}
                    className={styles.sendNotificationButton}
                >
                    <Send />
                </button>
            </div>
            <button className={styles.linkContainer} onClick={inviteLink ? handleCopy : generateLink}>
                <p className={styles.link}>{isLoading && !inviteLink ? 'Generating invite link...' :  !isLoading && inviteLink ? inviteLink : !isLoading && !inviteLink ? 'Press to generate invite link' : 'Something went wrong'}</p>
                    {inviteLink ? <IconsLibrary.Sync /> : <IconsLibrary.Copy />}
            </button>
            {error ? <p className={styles.error}>{error}</p> : null}
        </div>
    )
}


export default InviteModal;