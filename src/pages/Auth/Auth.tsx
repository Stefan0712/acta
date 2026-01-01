import { useState } from 'react';
import styles from './Auth.module.css';
import { IconsLibrary } from '../../assets/icons';
import { useNotifications } from '../../Notification/NotificationContext';
import { db } from '../../db';
import { MessageCircleWarning } from 'lucide-react';
import Login from './Login';
import Register from './Register';


interface AuthProps {
    next: ()=>void;
    onLoginSuccess: ()=>void;
}
const Auth: React.FC<AuthProps> = ({next, onLoginSuccess}) => {

    const [currentScreen, setCurrentScreen] = useState('login');

    const localUserToken = localStorage.getItem('jwt-token');
    if (next) {
        if(localUserToken){
            next()
        } else {
            return (
                <div className={styles.auth}>
                    <div className={styles.authContainer}>
                            {currentScreen === 'login' ? <Login onLoginSuccess={onLoginSuccess} next={next} toRegister={()=>setCurrentScreen('register')} /> 
                            : currentScreen === 'local' ? <Local onLoginSuccess={onLoginSuccess} back={()=>setCurrentScreen('login')} next={next} /> 
                            : <Register next={next} toLocal={()=>setCurrentScreen("local")} toLogin={()=>setCurrentScreen('login')} />}
                    </div>
                </div>
            )
        }
    } else {
        return (
            <div className={styles.auth}>
                <div className={styles.authContainer}>
                        {currentScreen === 'login' ? <Login toRegister={()=>setCurrentScreen('register')} /> 
                        : <Register toLocal={()=>setCurrentScreen("local")} toLogin={()=>setCurrentScreen('login')} />}
                </div>
            </div>
        )
    }
}

export default Auth;

interface LocalProps {
    next: () => void;
    back: () => void;
    onLoginSuccess: ()=>void;
}

const Local: React.FC<LocalProps> = ({next, back, onLoginSuccess}) => {

    const {showNotification} = useNotifications();

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState<null | string>(null);

    const handleUsernameInput = (value: string) => {
        setUsernameError(null)
        setUsername(value);
    }

    const handleSaveLocalAccount = async () =>{
        if(username.length > 0 && username.length < 16){
            const newUser = {
                _id: "local-user-id",
                username,
                email: "",
                avatarUrl: "",
                createdAt: new Date().toISOString()
            }
            await db.profile.add(newUser);
            localStorage.setItem('userId','local-user-id')
            localStorage.setItem('username', username);
            showNotification(`A local account with username ${username} was created!`, "success");
            next();
            onLoginSuccess();
        } else {
            setUsernameError("Username is invalid. It should be between 1 and 16 characters!")
        }
    }

    return (
        <div className={styles.local}>
            <h1>Create a local account</h1>
            

            <fieldset>
                <label>Username</label>
                <input value={username} onChange={(e)=>handleUsernameInput(e.target.value)} placeholder='Enter your username...' />
                {usernameError ? <p className='error-message'>{usernameError}</p> : null}
            </fieldset>

            <div className={styles.warning}>
                <div className={styles.header}>
                    <MessageCircleWarning />
                    <h2>Warning</h2>
                </div>
                <p>A local account is limited to only local lists. For online features like creating or joining groups, a full online account is required.</p>
            </div>
            
            <button className={styles.submitButton} onClick={handleSaveLocalAccount}>Create</button>

            <button className={styles.backButton} onClick={back}>
                <IconsLibrary.Arrow />
                <p>Back to Register</p>
            </button>
        </div>
    )
}


