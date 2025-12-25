import { useEffect, useMemo, useState } from 'react';
import styles from './Polls.module.css';
import Poll from './Poll/Poll';
import { IconsLibrary } from '../../../assets/icons';
import NewPoll from './NewPoll/NewPoll';
import { type Poll as IPoll } from '../../../types/models';
import { useParams } from 'react-router-dom';
import { getPollsByGroup } from '../../../services/pollService';



const Polls = () => {

    const {groupId} = useParams();
    
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showNewPoll, setShowNewPoll] = useState(false);
    const [polls, setPolls] = useState<IPoll[]>([])
    const filteredPolls = useMemo(() => {
        if (!polls) return [];

        return polls.filter(poll => {
            switch (selectedFilter) {
                case 'all':
                    return poll;
                case 'active':
                    return !poll.isClosed && poll.expiresAt > new Date();
                case 'finished':
                    return poll.isClosed || poll.expiresAt < new Date();
                default:
                    return false;
            }
        });
    }, [polls, selectedFilter]);


    const fetchPolls = async () => {
        if(groupId){
            try {
                const apiResposne = await getPollsByGroup(groupId)
                setPolls(apiResposne);
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(()=>{
        fetchPolls();
    }, [groupId])

    return (
        <div className={styles.polls}>
            {showNewPoll ? <NewPoll handleAddPoll={(newPoll)=>setPolls(prev=>[...prev, newPoll])} close={()=>setShowNewPoll(false)} /> : null}
            {showNewPoll ? null : <button onClick={()=>setShowNewPoll(true)} className={styles.newPollButton}>
                <IconsLibrary.Plus />
            </button>}
            <div className={styles.filters}>
                <button onClick={()=>setSelectedFilter('all')} className={selectedFilter === 'all' ? styles.selectedFilter : ''}>All</button>
                <button onClick={()=>setSelectedFilter('active')} className={selectedFilter === 'active' ? styles.selectedFilter : ''}>Active</button>
                <button onClick={()=>setSelectedFilter('finished')} className={selectedFilter === 'finished' ? styles.selectedFilter : ''}>Finished</button>
            </div>
            <div className={styles.container}>
                {filteredPolls?.length > 0 ? filteredPolls.map(poll => <Poll remove={(pollId)=>setPolls(prev=>[...prev.filter(item=>item._id!==pollId)])} data={poll} key={poll._id} />) : <p className='no-items-text'>No polls</p>}
            </div>
        </div>
    )
}


export default Polls;