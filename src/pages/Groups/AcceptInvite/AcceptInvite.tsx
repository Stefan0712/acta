import { useEffect, useState } from 'react';
import styles from './AcceptInvite.module.css';
import { acceptInviteToken, lookupInvite } from '../../../services/groupService';
import { type InviteLookupData } from '../../../types/models';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../../db';


const AcceptInvite = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);

    const [data, setData] = useState<InviteLookupData | null>(null);

    useEffect(()=>{
        const fetchInviteData = async () => {
            if(token) {
                try {
                const inviteData = await lookupInvite(token);
                setData(inviteData);
                console.log(inviteData)
            } catch (err: any) {
                console.log(err.message || 'Failed to retrieve invite details.');
            }
            }
        };

        if(token) {
            fetchInviteData();
        }
    },[token]);

    const handleAccept = async () => {
        if (!token || !data) return;
        setIsLoading(true);

        // Check for Authentication
        if (!localStorage.getItem('jwt-token')) {
            localStorage.setItem('pending_invite_token', token);
            navigate('/login');
            return;
        }
        try {
            const response = await acceptInviteToken(token); 
            const newGroup = response.group;

            // Update local database
            await db.groups.put({
                ...newGroup,
                isDirty: false, 
            });

            // Trigger a full sync.
            navigate(`/group/${newGroup._id}`); 

        } catch (err: any) {
            console.error("Join Error:", err);
            console.log(err.message || 'Failed to join the group.');
        } finally {
             setIsLoading(false);
        }
    };



    if(!data){
        return (
            <p>Loading</p>
        )
    } else {
        return (
            <div className={styles.acceptInvite}>
                <div className={styles.header}><h3>Accept Invite</h3></div>
                <div className={styles.inviteMessage}>
                    <h3>You have been invited to {data.group.name}</h3>
                    <h4>There are {data.group.memberCount} members waiting for you!</h4>
                </div>
                <button onClick={handleAccept}>Accept</button>

            </div>
        )
    }
    
}

export default AcceptInvite;