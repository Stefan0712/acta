import { Link } from 'react-router-dom';
import styles from './InitialImport.module.css';


const InitialImport = () =>{

    return (
        <div className={styles.InitialImport}>
            <h2>Import</h2>

            <Link to={'/lists'}>Finish</Link>
        </div>
    )
}

export default InitialImport;