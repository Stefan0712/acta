import { useState } from 'react';
import { IconsLibrary } from '../../../assets/icons';
import { generateInviteToken, inviteUser } from '../../../services/groupService';
import { useNotifications } from '../../../Notification/NotificationContext';
import { Send, UserPlus } from 'lucide-react';

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
        if (username.length > 0){
            try {
                const sendInviteResponse = await inviteUser(groupId, username);
                console.log(sendInviteResponse)
                showNotification("Invite sent!", "success");
                setUsername('');
            } catch (error) {
                console.error(error);
                showNotification("Failed to send invite. Try again!", "error")
            }
        }
    }
    return (
        <div className='w-full p-4 flex flex-col gap-2 bg-zinc-900 rounded-xl border border-white/10'>
            <div className='flex gap-2'>
                <div className='bg-zinc-800 flex items-center justify-center rounded-xl size-[50px]'>
                    <UserPlus />
                </div>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-bold text-white'>Invite Members</h3>
                    <p className='text-sm text-white/50'>Invite other users to this group.</p>
                </div>
            </div>
            <div className='w-full grid grid-cols-[1fr_40px] items-center gap-2'>
                <input 
                    name='username' 
                    type='text'
                    onChange={(e)=>setUsername(e.target.value)}
                    value={username}
                    placeholder='Enter username...'
                    minLength={0}
                    className='bg-zinc-950 rounded-lg text-white/70 p-2 h-[40px]'
                />
                <button 
                    onClick={handleSendInvite}
                    className='size-[40px] rounded-lg flex items-center justify-center text-black bg-yellow-500'
                >
                    <Send />
                </button>
            </div>
            <button className='w-full grid grid-cols-[1fr_auto] px-2 gap-2 items-center bg-white/10 py-2 rounded-lg' onClick={inviteLink ? handleCopy : generateLink}>
                <p className='text-white/60 text-start'>{isLoading && !inviteLink ? 'Generating invite link...' :  !isLoading && inviteLink ? inviteLink : !isLoading && !inviteLink ? 'Press to generate invite link' : 'Something went wrong'}</p>
                {inviteLink ? <IconsLibrary.Sync /> : <IconsLibrary.Copy />}
            </button>
            {error ? <p className='text-red-500'>{error}</p> : null}
        </div>
    )
}


export default InviteModal;