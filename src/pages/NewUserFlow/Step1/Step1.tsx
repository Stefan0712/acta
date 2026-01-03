import { useEffect, useState } from 'react';
import styles from './Step1.module.css';
import { checkApi } from '../../../services/authService';
import { Github } from 'lucide-react';


const Step1 = ({next}: {next: ()=>void}) =>{    
    
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
                <h1>Warning!</h1>
                <p>
                    Welcome and thank you for trying this app! Before continuing, please remember that this app is still in development and 
                    you will find some bugs. There are still some features that does NOT work yet and some buttons, menus, or other elements might
                    be broken, but most of the app should work by now. 
                </p>
            </div>
            <div className={styles.message}>
                <p>Logging in/registering and groups are ONLINE ONLY for now. Please check the API status before trying to use them.</p>
                <div className={styles.apiStatus}>
                    {isApiOn ? <p>API is up</p> : <p>API is down</p>}
                    <div className={styles.statusCircle} style={isApiOn ? {backgroundColor: 'green'} : {backgroundColor: 'red'}} />
                </div>
            </div>
            <div className={styles.message}>
                <h1>Having issues?</h1>
                <p>For issues or suggestions, please contact me at s.vladulescu@gmail.com or open an issue on GitHub.</p>
            </div>
            <button className={styles.githubButton}>
                <Github /> <p>Github</p>
            </button>
            <button className={styles.nextButton} onClick={next}>Get Started</button>
        </div>
    )
}

export default Step1;