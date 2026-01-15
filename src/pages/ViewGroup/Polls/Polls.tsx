import { useMemo, useState } from 'react';
import styles from './Polls.module.css';
import Poll from './Poll/Poll';
import { IconsLibrary } from '../../../assets/icons';
import NewPoll from './NewPoll/NewPoll';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';



const Polls = () => {

    const {groupId} = useParams();
    
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showNewPoll, setShowNewPoll] = useState(false);

    const polls = useLiveQuery(async () => {
        return await db.polls.where({groupId}).toArray();
    })


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



    return (
        <div className={styles.polls}>
            {showNewPoll ? <NewPoll close={()=>setShowNewPoll(false)} /> : null}
            {showNewPoll ? null : <button onClick={()=>setShowNewPoll(true)} className={styles.newPollButton}>
                <IconsLibrary.Plus />
            </button>}
            <div className={styles.filters}>
                <button onClick={()=>setSelectedFilter('all')} className={selectedFilter === 'all' ? styles.selectedFilter : ''}>All</button>
                <button onClick={()=>setSelectedFilter('active')} className={selectedFilter === 'active' ? styles.selectedFilter : ''}>Active</button>
                <button onClick={()=>setSelectedFilter('finished')} className={selectedFilter === 'finished' ? styles.selectedFilter : ''}>Finished</button>
            </div>
            <div className={styles.container}>
                {filteredPolls?.length > 0 ? filteredPolls.map(poll => <Poll data={poll} key={poll._id} />) : <p className='no-items-text'>No polls</p>}
            </div>
        </div>
    )
}


export default Polls;