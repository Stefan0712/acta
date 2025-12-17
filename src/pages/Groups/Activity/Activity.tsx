import { useState } from 'react';
import styles from './Activity.module.css';

const Activity = () => {

    const [filter, setFilter] = useState('all');



    
    return ( 
        <div className={styles.activity}>
            <div className={styles.filters}>
                <button onClick={()=>setFilter('all')} className={filter === 'all' ? styles.selectedFilter : ''}>All</button>
                <button onClick={()=>setFilter('mine')} className={filter === 'mine' ? styles.selectedFilter : ''}>Mine</button>
            </div>
            <div className={styles.logsContainer}>
                <div className={styles.log}>
                    <div className={styles.logCircle} />
                    <div className={styles.content}>
                        <p className={styles.message}>You added Milk to Groceries</p>
                        <b>18 Sep 21:20</b>
                    </div>
                </div>
                <div className={styles.log}>
                    <div className={styles.logCircle} />
                    <div className={styles.content}>
                        <p className={styles.message}>Mike joined Christmas Party</p>
                        <b>18 Sep 21:20</b>
                    </div>
                </div>
                <div className={styles.log}>
                    <div className={styles.logCircle} />
                    <div className={styles.content}>
                        <p className={styles.message}>Where to host the party poll was created in Christmas Party</p>
                        <b>18 Sep 21:20</b>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default Activity;