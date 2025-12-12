import { useEffect, useState } from 'react';
import { IconsLibrary } from '../../../assets/icons';
import styles from './Manage.module.css';
import { generateInviteToken } from '../../../services/groupService';

const InviteModal = ({close, groupId}: {close: ()=>void, groupId: string}) => {

    const [inviteLink, setInviteLink] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(()=>{
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

        if (groupId) {
            generateLink();
        }
        
    },[groupId])

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setMessage('Link copied to clipboard!'); 
    };

    return (
        <div className={styles.inviteModal}>
            <h3>Share invitation link!</h3>
            {isLoading ? <p>Generating invite link...</p> : 
            !isLoading && inviteLink ? <div className={styles.linkContainer} onClick={handleCopy}>
                <p>{inviteLink}</p>
                <IconsLibrary.Copy />
            </div> : <p>Something went wrong. Try again!</p>}
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.message}>{message}</p> : null}
            <button onClick={close}>Done</button>
        </div>
    )
}


export default InviteModal;