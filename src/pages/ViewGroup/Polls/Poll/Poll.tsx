import { IconsLibrary } from '../../../../assets/icons';
import { formatRelativeTime } from '../../../../helpers/dateFormat';
import type { Poll, PollOption } from '../../../../types/models';
import styles from './Poll.module.css';

interface PollProps {
    data: Poll;
}
const Poll: React.FC<PollProps> = ({data}) => {
    const totalAnswers = data.options.reduce((sum, opt) => sum + opt.votes.length, 0);
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
                {data?.options?.map(option=><Option isEnded={data.isClosed || data.expiresAt < new Date()} totalAnswers={totalAnswers} option={option} />)}
            </div>
        </div>
    )
}

export default Poll;

interface OptionProps {
    option: PollOption;
    totalAnswers: number;
    isEnded: boolean;
}
const Option: React.FC<OptionProps> = ({option, totalAnswers, isEnded}) => {


    const percentage = (option.votes.length / totalAnswers) * 100;
    return (
        <button key={option._id} className={styles.option} style={isEnded ? {background: `linear-gradient(to right, rgba(59, 130, 246, 0.5) ${percentage}%, transparent ${percentage}%)`} : {}}>
            <div className={`${styles.optionCircle}`} />
            <h3>{option.text}</h3>
        </button>
    )
}
