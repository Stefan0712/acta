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
                    <p>TOTAL PROGRESS</p>
                    <b>{totalItems === 0 ? 0 : percentage.toFixed(2) || 0}%</b>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressLine} style={{width: `${percentage}%`}} />
                </div>
            </div>
        </div>
    )  
}

export default Summaries;