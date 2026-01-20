import { useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import type { Poll as IPoll, PollOption } from '../../../../types/models';
import styles from './Poll.module.css';
import { addPollOption, deletePoll, endPoll, updatePoll } from '../../../../services/pollService';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import EditPoll from '../EditPoll/EditPoll';
import Loading from '../../../../components/LoadingSpinner/Loading';
import { castVote } from '../../../../services/offlineManager';
import { useNotifications } from '../../../../Notification/NotificationContext';
import { ObjectId } from 'bson';
import { db } from '../../../../db';

interface PollProps {
    data: IPoll;
}
const Poll: React.FC<PollProps> = ({data}) => {
    
    const userId = localStorage.getItem('userId');

    const {showNotification} = useNotifications();


    const [showEdit, setShowEdit] = useState(false);

    const [processEnding, setProcessEnding] = useState(false);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEndPollModal, setShowEndPollModal] = useState(false);


    const handleVote = async (optionId: string) => {
        if ( userId ) {
            try {
                await castVote(data._id, optionId, userId);
            } catch (error) {
                console.error(error)
            }
        }
    }

    const handleDelete = async () => {
        try {
            await deletePoll(data._id);
            await db.polls.delete(data._id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error(error);
        }
    }
    const handleUpdatePoll = async (updatedPoll: IPoll) => {
        try{
            const apiResponse = await updatePoll(data._id, updatedPoll);
            await db.polls.put(apiResponse);
        } catch (error) {
            console.error(error);
            showNotification('Failed to update poll!', "error");
        }
    }

    const handleEndPoll = async () => {
        setProcessEnding(true);
        try {
            const apiResponse = await endPoll(data._id);
            if(apiResponse) {
                setShowEndPollModal(false);
                setProcessEnding(false);
            }
        } catch (error) {
            console.error(error);
            setProcessEnding(false);
        }
    }
    const totalAnswers = data ? data?.options?.reduce((sum, opt) => sum + (opt?.votes?.length ?? 0), 0) : 0;

    if(!data){
        return ( <Loading />)
    }else {
        return (
            <div className={styles.poll}>
                {showDeleteModal ? <ConfirmationModal cancel={()=>setShowDeleteModal(false)} confirm={()=>handleDelete()} content='Do you want to delete this poll?'/> : null}
                {showEndPollModal ? <ConfirmationModal cancel={()=>setShowEndPollModal(false)} confirm={()=>handleEndPoll()} content='Users will not be able to submit more answers if you end this poll. Continue?'/> : null}
                {showEdit ? <EditPoll pollId={data._id} close={()=>setShowEdit(false)} handleUpdatePoll={handleUpdatePoll} /> : null}
                <div className={styles.header}>
                    <div className={styles.pollAuthor}>
                        <div className={styles.userPfp}>
                            <p>{data.authorUsername ? data?.authorUsername.charAt(0).toUpperCase() : '?'}</p>
                        </div>
                        <b>{data.authorUsername ?? 'Unknown Author'}</b>
                    </div>
                    <div className={styles.headerButtons}>
                        <button onClick={()=>setShowEdit(true)}><IconsLibrary.Edit /></button>
                        <button onClick={()=>setShowDeleteModal(true)}><IconsLibrary.Delete /></button>
                    </div>
                </div>
                <h1>{data.title}</h1>
                <p className={styles.description}>{data.description || "No context was given"}</p>
                <div className={styles.options}>
                    {data.options?.map(option=><Option handleVote={handleVote} key={option._id} isEnded={data.isClosed || (data.expiresAt && data.expiresAt < new Date())} totalAnswers={totalAnswers} option={option} />)}
                    {data.allowCustomOptions ? <NewOption handleVote={handleVote} pollId={data._id} totalOptions={data.options.length} /> : null}
                </div>
                {data.authorId === userId ? 
                    <div className={styles.managePoll}>
                        <button onClick={()=>setShowEndPollModal(true)} disabled={processEnding || data.isClosed}>{processEnding ? <IconsLibrary.Spinner /> : data.isClosed ? 'Poll Ended' : 'End Poll'}</button>
                    </div> : null
                }
            </div>
        )
    }
}

export default Poll;

interface OptionProps {
    option: PollOption;
    totalAnswers: number;
    isEnded: boolean;
    handleVote: (optionId: string)=> void;
}
const Option: React.FC<OptionProps> = ({option, totalAnswers, isEnded, handleVote}) => {


    const percentage = ((option?.votes?.length ?? 0) / totalAnswers) * 100;
    const currentUser = localStorage.getItem('userId');
    const isOptionVoted = currentUser && option.votes?.includes(currentUser);
    return (
        <button onClick={()=>option._id && !isEnded ? handleVote(option._id) : null} key={option._id} className={`${styles.option} ${isOptionVoted ? styles.selectedOption : ''}`} style={isEnded ? {background: `linear-gradient(to right, rgba(59, 130, 246, 0.5) ${percentage}%, transparent ${percentage}%)`} : {}}>
            <div className={`${styles.optionCircle}`} />
            <h3>{option.text}</h3>
            {isEnded ? <p>{totalAnswers}</p> : null}
        </button>
    )
}


interface NewOptionProps {
    totalOptions: number;
    pollId: string;
    handleVote: (optionId: string)=> void;
}

const NewOption: React.FC<NewOptionProps> = ({pollId, handleVote}) => {

    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const {showNotification} = useNotifications();
    const userId = localStorage.getItem('userId');

    
    const handleAdd = async () => {
        if(!text || text.length < 1 || text.length > 50) {
            setError("Option invalid. It should be between 1 and 50 characters.")
        } else {
            setIsLoading(true);
            try {
                const newOption = {
                    _id: new ObjectId().toHexString(),
                    text: text,
                    votes: [userId ?? '']
                }
                const apiResponse = await addPollOption(pollId, newOption, userId ?? '');
                if(apiResponse._id) {
                    handleVote(apiResponse._id);
                    setText('');
                }
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                showNotification("Failed to add option", "error");
                setIsLoading(false);
            }
        }
    }

    return (
        <div className={styles.newOption}>
            <input type='text' value={text} onChange={(e)=>setText(e.target.value)} style={error ? {color: 'red', borderColor: 'red'} : {}} placeholder={error ? error : 'Add another answer...'} />
            <button onClick={handleAdd} disabled={isLoading}>{isLoading ? <IconsLibrary.Spinner /> :<IconsLibrary.Plus />}</button>
        </div>
    )
}
