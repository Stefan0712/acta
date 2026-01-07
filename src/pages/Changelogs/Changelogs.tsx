import {CHANGELOGS_ITEMS} from './changelogs';
import Header from '../../components/Header/Header';
import styles from './Changelogs.module.css';



const Changelogs = () => {

    return (
        <div className={styles.changelogs}>
            <Header title='Changelogs' />
            <div className={styles.changelogsContainer}>
                {CHANGELOGS_ITEMS?.length > 0 ? CHANGELOGS_ITEMS.map(log=><div key={log.date} className={styles.changelog}>
                    <h1>{log.date}</h1>
                    <p>{log.description}</p>
                    <ul>
                        {log.listItems?.length > 0 ? log.listItems?.map((item, index)=><li key={'List-item-'+index}>{item}</li>) : null}
                    </ul>
                </div>) : <p className='no-items-text'>No logs to show</p>}
            </div>
        </div>
    )
}

export default Changelogs;