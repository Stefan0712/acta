import styles from './Summaries.module.css';


interface SummariesProps {
    totalItems: number;
    completedItems: number;
}

const Summaries: React.FC<SummariesProps> = ({totalItems, completedItems}) =>{


    const percentage = (completedItems/totalItems)*100;
    return (
        <div className={styles.summaries}>
            <div className={styles.collumns}>
                <div className={styles.collumn}>
                    <b>{totalItems ?? 0}</b>
                    <p>TOTAL</p>
                </div>
                <div className={styles.collumn}>
                    <b>{totalItems && completedItems ? (totalItems - completedItems) : 0}</b>
                    <p>ACTIVE</p>
                </div>
                <div className={styles.collumn}>
                    <b>{completedItems || 0}</b>
                    <p>COMPLETED</p>
                </div>
            </div>
            <div className={styles.progress}>
                <div className={styles.progressText}>
                    <p>TOTAL PROGRESS</p>
                    <b>{percentage.toFixed(2) || 0}%</b>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressLine} style={{width: `${percentage}%`}} />
                </div>
            </div>
        </div>
    )  
}

export default Summaries;