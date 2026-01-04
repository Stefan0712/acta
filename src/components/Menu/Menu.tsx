import { Link } from 'react-router-dom';
import styles from './Menu.module.css';
import { IconsLibrary } from '../../assets/icons';
import { logout } from '../../services/authService';
import { useState } from 'react';
import { HelpCircleIcon } from 'lucide-react';


const Menu = ({close}: {close:()=>void}) => {

    const isLoggedIn = localStorage.getItem('jwt-token');
    const [expandUserInfo, setExpandUserInfo] = useState(false);


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
                <Link className={styles.fullWidthButton} to={'/about'} onClick={close}>
                    <HelpCircleIcon />
                    <p>About</p>
                </Link>
                <div className={styles.authButton}>
                    <div className={styles.buttonContent}>
                        <IconsLibrary.Arrow 
                            style={expandUserInfo ? {transform: "rotateZ(90deg)"} : {transform: "rotateZ(-90deg)"}} 
                            onClick={()=>setExpandUserInfo(prev=>!prev)}
                        />
                        <b onClick={()=>setExpandUserInfo(prev=>!prev)}>{isLoggedIn ? localStorage.getItem('username') : 'Local Account'}</b>
                        {isLoggedIn ? <button onClick={logout}><IconsLibrary.Logout /> <p>Logout</p></button> : <Link to={'/auth'}><IconsLibrary.Login /> <p>Login</p></Link>}
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