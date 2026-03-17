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
        <div className='w-full h-full grid grid-rows-[auto_1fr] gap-3 px-4'>
            {showNewPoll ? <NewPoll close={()=>setShowNewPoll(false)} /> : null}
                <div className='w-full grid grid-cols-[1fr_auto] gap-2 mb-2'>
                <div className='p-1 w-fit flex gap-2 items-center'>
                    <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'all' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('all')}>All</button>
                    <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'active' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('active')}>Active</button>
                    <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'finished' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('finished')}>Finished</button>
                </div>
                <button onClick={()=>setShowNewPoll(true)} className='text-white/80 flex items-center gap-2'>
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