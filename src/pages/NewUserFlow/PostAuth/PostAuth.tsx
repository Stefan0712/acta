import { Link } from 'react-router-dom';
import styles from './PostAuth.module.css';
import { useEffect } from 'react';
import Loading from '../../../components/LoadingSpinner/Loading';

interface PostAuthProps {
    goBack: () => void;
}
const PostAuth: React.FC<PostAuthProps> = ({goBack}) =>{

    const userId = localStorage.getItem('userId');

    
    useEffect(()=>{
        if(!userId){
            goBack()
        }
    },[])
    
    if(!userId){
        return (<Loading />)
    }
    return (
        <div className={styles.postAuth}>
            <h1>Import Data</h1>
            <p>Do you have any old data? You can import it at any time!</p>

            <Link to={'/import'}>Import</Link>

            <Link className={styles.finishButton} to={'/lists'}>Finish</Link>
        </div>
    )
    
}

export default PostAuth;