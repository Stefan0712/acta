import styles from './Summaries.module.css';


interface SummariesProps {
    totalItems: number;
    completedItems: number;
}

const Summaries: React.FC<SummariesProps> = ({totalItems, completedItems}) =>{


    const percentage = (completedItems/totalItems)*100;
    return (
        <div className={styles.summaries}>
            <div className={styles.progress}>
                <div className={styles.progressText}>
                    <p>PROGRESS</p>
                </div>
                <div className='w-full grid grid-cols-[1fr_auto] gap-2 items-center'>
                    <div className={styles.progressBar}>
                        <div className={styles.progressLine} style={{width: `${percentage}%`}} />
                    </div>
                    <p className='bg-zinc-900 px-2 text-sm text-white/70 rounded'>{completedItems ?? 0} / {totalItems ?? 0}</p>
                </div>
            </div>
        </div>
    )  
}

export default Summaries;