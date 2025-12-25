import { useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import { formatRelativeTime } from '../../../../helpers/dateFormat';
import type { Poll, PollOption } from '../../../../types/models';
import styles from './Poll.module.css';
import { addPollOption, submitVote } from '../../../../services/pollService';

interface PollProps {
    data: Poll;
}
const Poll: React.FC<PollProps> = ({data}) => {

    const [options, setOptions] = useState([...data.options])

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

    const totalAnswers = data.options.reduce((sum, opt) => sum + (opt?.votes?.length ?? 0), 0);
    return (
        <div className={styles.poll}>
            <div className={styles.header}>
                <h1>{data.title}</h1>
                <div className={styles.meta}>
                    <p>By {data.authorUsername}</p>
                    {data.expiresAt ? <p className={styles.dueTime}><IconsLibrary.Time /> {formatRelativeTime(data.expiresAt)}</p> : null}
                    <p className={styles.optionCoutner}>{data.options.length ?? 0} OPTIONS</p>
                </div>
            </div>
            <div className={styles.options}>
                {options?.map(option=><Option handleVote={handleVote} key={option._id} isEnded={data.isClosed || (data.expiresAt && data.expiresAt < new Date())} totalAnswers={totalAnswers} option={option} />)}
                {data.allowCustomOptions ? <NewOption handleVote={handleVote} pollId={data._id} addOption={(newOption)=>setOptions(prev=>[...prev, newOption])} totalOptions={options.length} /> : null}
            </div>
        </div>
    )
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
