import { Link } from 'react-router-dom';
import styles from './Welcome.module.css';

const Welcome= () =>{



    
    return (
        <div className={styles.postAuth}>
            <h1>Import Data</h1>
            <p>Do you have any old data? You can import it at any time!</p>

            <Link to={'/import'}>Import</Link>

            <Link className={styles.finishButton} to={'/lists'}>Finish</Link>
        </div>
    )
    
}

export default Welcome;