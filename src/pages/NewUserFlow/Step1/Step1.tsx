import { useEffect, useState } from 'react';
import styles from './Step1.module.css';
import { checkApi } from '../../../services/authService';
import { Github } from 'lucide-react';
import LocalUserForm from '../../Auth/LocalUserForm';

interface Props {
    next: ()=>void;
    onLoginSuccess: ()=>void;
}
const Step1: React.FC<Props> = ({onLoginSuccess, next}) =>{    
    
    const [isApiOn, setIsApiOn] = useState(false);

    const checkIfAPIisOn = async () => {
        try {
            const response = await checkApi();
            setIsApiOn(response)
        } catch ( error ) {
            console.error(error);
        }
    }
    useEffect(()=>{
        checkIfAPIisOn();
    },[])


    return (
        <div className={styles.stepComponent}>

            <div className={styles.message}>
                <p>Logging in/registering and groups are ONLINE ONLY for now. Please check the API status before trying to use them.</p>
                <div className={styles.apiStatus}>
                    {isApiOn ? <p>API is up</p> : <p>API is down</p>}
                    <div className={styles.statusCircle} style={isApiOn ? {backgroundColor: 'green'} : {backgroundColor: 'red'}} />
                </div>
            </div>
            <div className={styles.message}>
                <h1>Offline Only</h1>
                <p>If you want to use the app only offline, you can do that by just setting your username</p>
                <LocalUserForm onLoginSuccess={onLoginSuccess} />
            </div>
            <div className={styles.message}>
                <h1>Having issues?</h1>
                <p>For issues or suggestions, please contact me at s.vladulescu@gmail.com or open an issue on GitHub.</p>
            </div>
            <button className={styles.githubButton}>
                <Github /> <p>Github</p>
            </button>
            <button className={styles.nextButton} onClick={next}>To login</button>
        </div>
    )
}

export default Step1;