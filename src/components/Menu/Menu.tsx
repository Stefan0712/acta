import { Link } from 'react-router-dom';
import styles from './Menu.module.css';
import { IconsLibrary } from '../../assets/icons';
import { logout } from '../../services/authService';
import { useState } from 'react';
import { HelpCircleIcon } from 'lucide-react';
import { useNotifications } from '../../Notification/NotificationContext';
import { db } from '../../db';


const Menu = ({close}: {close:()=>void}) => {

    const {showNotification} = useNotifications();

    const isLoggedIn = localStorage.getItem('jwt-token');
    const [expandUserInfo, setExpandUserInfo] = useState(false);


    const handleLogout = () => {
        const isLoggedOut = logout();

        if (isLoggedOut) {
            showNotification("Logged out successfully",'success');
        } else {
            showNotification("Failed to log out",'error');
        }
    }

    const handleResetQueue = async () => {
        try {
            await db.syncQueue.clear();
            showNotification("Sync Queue reset!","success")
        } catch (error) {
            console.error(error);
            showNotification("Failed to reset Sync Queue", "success")
        }
    }
    return ( 
        <div className={styles.menuBg}>
            <div className={styles.menu}>
                <div className={styles.header}>
                    <h2>Menu</h2>
                    <button onClick={close}>
                        <IconsLibrary.Close />
                    </button>
                </div>
                <div className={styles.section}>
                    <Link to={'/export'} onClick={close}>
                        <IconsLibrary.Export />
                        <p>Export</p>
                    </Link>
                    <Link to={'/import'} onClick={close}>
                        <IconsLibrary.Import />
                        <p>Import</p>
                    </Link>
                <Link to={'/'}>
                    <IconsLibrary.Sync />
                    <p>Sync</p>
                </Link>
                </div>
                <Link className={styles.fullWidthButton} to={'/'}>
                    <IconsLibrary.Settings />
                    <p>Settings</p>
                </Link>
                <Link className={styles.fullWidthButton} to={'/changelogs'} onClick={close}>
                    <IconsLibrary.List2 />
                    <p>Changelogs</p>
                </Link>
                <Link className={styles.fullWidthButton} to={'/about'} onClick={close}>
                    <HelpCircleIcon />
                    <p>About</p>
                </Link>
                <div className={styles.fullWidthButton} onClick={handleResetQueue}>
                    <HelpCircleIcon />
                    <p>Reset Sync Queue</p>
                </div>
                <div className={styles.authButton}>
                    <div className={styles.buttonContent}>
                        <IconsLibrary.Arrow 
                            style={expandUserInfo ? {transform: "rotateZ(90deg)"} : {transform: "rotateZ(-90deg)"}} 
                            onClick={()=>setExpandUserInfo(prev=>!prev)}
                        />
                        <b onClick={()=>setExpandUserInfo(prev=>!prev)}>{isLoggedIn ? localStorage.getItem('username') : 'Local Account'}</b>
                        {isLoggedIn ? <button className={styles.logoutButton} onClick={handleLogout}><IconsLibrary.Logout /> <p>Logout</p></button> : <Link to={'/auth'}><IconsLibrary.Login /> <p>Login</p></Link>}
                    </div>
                    {expandUserInfo ? <div className={styles.userInfo}>
                        <fieldset>
                            <label>Username </label>
                            <p>{localStorage.getItem('username')}</p>
                        </fieldset>
                        <fieldset>
                            <label>User's ID </label>
                            <p>{localStorage.getItem('userId')}</p>
                        </fieldset>
                        <fieldset>
                            <label>Is token present: </label>
                            <p>{isLoggedIn ? "Yes" : "No"}</p>
                        </fieldset>
                    </div> : null}
                </div>
            </div>
        </div>
     );
}
 
export default Menu;