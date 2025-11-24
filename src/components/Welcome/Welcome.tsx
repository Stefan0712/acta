import { useState } from 'react';
import { IconsLibrary } from '../../assets/icons';
import styles from './Welcome.module.css';
import { useUser } from '../../contexts/UserContext';

const Welcome = ({close}: {close: ()=>void}) => {
    const [username, setUsername] = useState('');
    const [currentScreen, setCurrentScreen] = useState('input');
    const {createLocalProfile} = useUser();

    const handleSaveUser = () => {
        createLocalProfile(username);
        close();
    }
    return ( 
        <div className={styles.welcome}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3>Hewwo</h3>
                    <button onClick={close}><IconsLibrary.Close /></button>
                </div>
                {currentScreen === 'input' ? <UsernameInput username={username} setUsername={(s)=>setUsername(s)} /> : 
                currentScreen === 'confirmation' ? <h2>Nice to meet you {username}-senpai ⸜(｡˃ ᵕ ˂ )⸝♡</h2> : ''}
                <div className={styles.buttons}>
                    {currentScreen === "input" ? <button className={styles.saveButton} onClick={()=>setCurrentScreen('confirmation')}>Continue</button> : null}
                    {currentScreen === "confirmation" ? 
                        <>
                            <button className={styles.saveButton} onClick={()=>setCurrentScreen('input')}>Back</button>
                            <button className={styles.saveButton} onClick={handleSaveUser}>Confirm</button>
                        </> 
                    : null}
                </div>
            </div>
        </div>
    );
}
 
export default Welcome;

interface UsernameInputProps {
    username: string;
    setUsername: (username: string) => void;
}
const UsernameInput: React.FC<UsernameInputProps> = ({username, setUsername}) => {
    return (
        <>
            <h2>Hewwo fwend. W-who are y-you?</h2>
            <input type='text' name='username' value={username} onChange={(e)=>setUsername(e.target.value)} minLength={1} required />
            
        </>
    )
}