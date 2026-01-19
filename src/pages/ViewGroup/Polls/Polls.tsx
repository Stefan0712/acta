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

    const polls = useLiveQuery( 
        () =>  db.polls.where({groupId}).toArray()
    )


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
            <div className={styles.pageMenu}>
                <select className='category-selector' value={selectedFilter} onChange={(e)=>setSelectedFilter(e.target.value)}>
                    <option value={'all'}>All</option>
                    <option value={'Active'}>Active</option>
                    <option value={'finished'}>Finished</option>
                </select>
                 <button onClick={()=>setShowNewPoll(true)} className={styles.newPollButton}>
                    <IconsLibrary.Plus />
                </button>
            </div>
            <div className={styles.container}>
                {filteredPolls?.length > 0 ? filteredPolls.map(poll => <Poll data={poll} key={poll._id} />) : <p className='no-items-text'>No polls</p>}
            </div>
        </div>
    )
}


export default Polls;