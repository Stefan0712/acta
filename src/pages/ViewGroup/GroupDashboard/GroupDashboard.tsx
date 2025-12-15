import { Link } from 'react-router-dom';
import styles from './GroupDashboard.module.css';
import { IconsLibrary } from '../../../assets/icons';

const GroupDashboard = () => {


    return (
        <div className={styles.groupDashboard}>
            <div className={styles.groupNavigation}>
                <Link to={'lists'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.List2 />
                        </div>
                        <b>Lists</b>
                    </div>
                    <p>3 active</p>
                </Link>
                <Link to={'notes'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.Note />
                        </div>
                        <b>Notes</b>
                    </div>
                    <p>5 Recent</p>
                </Link>
                <Link to={'polls'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.Poll2 />
                        </div>
                        <b>Polls</b>
                    </div>
                    <p>1 Ongoing</p>
                </Link>
                <Link to={'activity'}>
                    <div className={styles.buttonName}>
                        <div className={styles.navigationIcon}>
                            <IconsLibrary.Activity />
                        </div>
                        <b>Activity</b>
                    </div>
                    <p>5 New</p>
                </Link>
            </div>
            <div className={styles.dueSoon}>
                <div className={styles.sectionTitle}>
                    <IconsLibrary.Time />
                    <b>DUE SOON</b>
                </div>
                <div className={styles.dueItem}>
                    <div className={styles.color}></div>
                    <div className={styles.itemInfo}>
                        <b>Buy Charcoal</b>
                        <p>Camping Supplies</p>
                    </div>
                    <div className={styles.due}>Today</div>
                </div>
                <p className={styles.noDueItems}>No due items</p>
            </div>
        </div>
    )
}


export default GroupDashboard;