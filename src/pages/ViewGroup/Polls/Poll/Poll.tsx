import { useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import { formatRelativeTime } from '../../../../helpers/dateFormat';
import type { Poll, PollOption } from '../../../../types/models';
import styles from './Poll.module.css';
import { addPollOption, deletePoll, endPoll, submitVote } from '../../../../services/pollService';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import EditPoll from '../EditPoll/EditPoll';
import Loading from '../../../../components/LoadingSpinner/Loading';

interface PollProps {
    data: Poll;
    remove: (id: string) => void;
}
const Poll: React.FC<PollProps> = ({data, remove}) => {
    const userId = localStorage.getItem('userId');
    const [options, setOptions] = useState([...data.options]);
    const [showEdit, setShowEdit] = useState(false);
    const [pollData, setPollData] = useState<Poll | null>(data ?? null);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEndPollModal, setShowEndPollModal] = useState(false);


    const handleVote = async (optionId: string) => {
        try {
            const apiResponse = await submitVote(data._id, optionId);
            if(apiResponse.options && apiResponse.options.length > 0){
                setOptions(apiResponse.options)
            }
        } catch (error) {
            console.error(error)
        }
    }
    const handleDelete = async () => {
        try {
            await deletePoll(data._id);
            remove(data._id)
        } catch (error) {
            console.error(error);
        }
    }
    const handleUpdatePoll = (updatedPoll: Poll) => {
        setPollData(updatedPoll);
        setOptions(updatedPoll.options);
    }
    const handleEndPoll = async () => {
        try {
            const apiResponse = await endPoll(data._id);
            if(apiResponse) {
                setPollData(apiResponse);
                setShowEndPollModal(false);
            }
        } catch (error) {
            console.error(error);
        }
    }
    const totalAnswers = pollData ? pollData?.options?.reduce((sum, opt) => sum + (opt?.votes?.length ?? 0), 0) : 0;

    if(!pollData){
        return ( <Loading />)
    }else {
        return (
            <div className={styles.poll}>
                {showDeleteModal ? <ConfirmationModal cancel={()=>setShowDeleteModal(false)} confirm={()=>handleDelete()}/> : null}
                {showEndPollModal ? <ConfirmationModal cancel={()=>setShowEndPollModal(false)} confirm={()=>handleEndPoll()} content='Users will not be able to submit more answers if you end this poll. Continue?'/> : null}
                {showEdit ? <EditPoll pollId={pollData._id} close={()=>setShowEdit(false)} handleUpdatePoll={handleUpdatePoll} /> : null}
                <div className={styles.header}>
                    <h1>{pollData.title}</h1>
                    <div className={styles.meta}>
                        <p>By {pollData.authorUsername}</p>
                        {pollData.expiresAt ? <p className={styles.dueTime}><IconsLibrary.Time /> {formatRelativeTime(pollData.expiresAt)}</p> : null}
                        <p className={styles.optionCoutner}>{pollData.options.length ?? 0} OPTIONS</p>
                    </div>
                </div>
                <div className={styles.options}>
                    {options?.map(option=><Option handleVote={handleVote} key={option._id} isEnded={pollData.isClosed || (pollData.expiresAt && pollData.expiresAt < new Date())} totalAnswers={totalAnswers} option={option} />)}
                    {pollData.allowCustomOptions ? <NewOption handleVote={handleVote} pollId={pollData._id} addOption={(newOption)=>setOptions(prev=>[...prev, newOption])} totalOptions={options.length} /> : null}
                </div>
                {pollData.authorId === userId ? 
                    <div className={styles.managePoll}>
                        <button onClick={()=>setShowEndPollModal(true)}>End Poll</button>
                        <button onClick={()=>setShowEdit(true)}>Edit</button>
                        <button onClick={()=>setShowDeleteModal(true)}>Delete</button>
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
        <button onClick={()=>option._id ? handleVote(option._id) : null} key={option._id} className={`${styles.option} ${isOptionVoted ? styles.selectedOption : ''}`} style={isEnded ? {background: `linear-gradient(to right, rgba(59, 130, 246, 0.5) ${percentage}%, transparent ${percentage}%)`} : {}}>
            <div className={`${styles.optionCircle}`} />
            <h3>{option.text}</h3>
            {isEnded ? <p>{totalAnswers}</p> : null}
        </button>
    )
}


interface NewOptionProps {
    addOption: (option: PollOption) => void;
    totalOptions: number;
    pollId: string;
    handleVote: (optionId: string)=> void;
}

const NewOption: React.FC<NewOptionProps> = ({addOption, pollId, handleVote}) => {

    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);



    const handleAdd = async () => {
        if(!text || text.length < 1 || text.length > 50) {
            setError("Option invalid. It should be between 1 and 50 characters.")
        } else {
            try {
                const apiResponse = await addPollOption(pollId, text);
                if(apiResponse._id) {
                    handleVote(apiResponse._id);
                    addOption(apiResponse);
                    setText('');
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <div className={styles.newOption}>
            <input type='text' value={text} onChange={(e)=>setText(e.target.value)} style={error ? {color: 'red', borderColor: 'red'} : {}} placeholder={error ? error : 'Add another answer...'} />
            <button onClick={handleAdd}><IconsLibrary.Plus /></button>
        </div>
    )
}
