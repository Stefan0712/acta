import { Link, useNavigate } from 'react-router-dom';
import styles from './Menu.module.css';
import { IconsLibrary } from '../../assets/icons';
import { logout } from '../../services/authService';
import { useState } from 'react';


const Menu = ({close}: {close:()=>void}) => {

    const isLoggedIn = localStorage.getItem('jwt-token');
    const navigate = useNavigate();
    const [expandUserInfo, setExpandUserInfo] = useState(false);


    return ( 
        <div className={styles.menuBg}>
            <div className={styles.menu}>
                <h2>Menu</h2>
                <div className={styles.section}>
                    <Link to={'/export'}>
                        <IconsLibrary.Export />
                        <p>Export</p>
                    </Link>
                    <Link to={'/import'}>
                        <IconsLibrary.Import />
                        <p>Import</p>
                    </Link>
                </div>
                <div className={styles.section}>
                    <Link to={'/'}>
                        <IconsLibrary.Settings />
                        <p>Settings</p>
                    </Link>
                    <Link to={'/'}>
                        <IconsLibrary.Sync />
                        <p>Sync</p>
                    </Link>
                </div>
                <div className={styles.authButton} onClick={()=> !isLoggedIn ? navigate('/auth') : null}>
                    <div className={styles.buttonContent}>
                        <IconsLibrary.Arrow 
                            style={expandUserInfo ? {transform: "rotateZ(90deg)"} : {transform: "rotateZ(-90deg)"}} 
                            onClick={()=>setExpandUserInfo(prev=>!prev)}
                        />
                        <b onClick={()=>setExpandUserInfo(prev=>!prev)}>{isLoggedIn ? localStorage.getItem('username') : 'Login'}</b>
                        {isLoggedIn ? <button onClick={logout}><IconsLibrary.Logout /></button> : <Link to={'/auth'}><IconsLibrary.Login /></Link>}
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
                <button id={styles.closeButton} onClick={close}>Close</button>
            </div>
        </div>
     );
}
 
export default Menu;