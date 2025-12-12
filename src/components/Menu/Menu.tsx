import { Link, useNavigate } from 'react-router-dom';
import styles from './Menu.module.css';
import { IconsLibrary } from '../../assets/icons';
import { logout } from '../../services/authService';


const Menu = ({close}: {close:()=>void}) => {

    const isLoggedIn = localStorage.getItem('jwt-token');
    const navigate = useNavigate();

    const goToProfile = () => {
        console.log("This will send the user to the profile page")
    }
    return ( 
        <div className={styles.menu}>
            <h2>Menu</h2>
            <p>Username: {localStorage.getItem('username')}</p>
            <p>Id: {localStorage.getItem('userId')}</p>
            <p>Token: {isLoggedIn}</p>
            <div className={styles.section}>
                <Link to={'/'}>
                    <IconsLibrary.Collection />
                    <p>Items Collection</p>
                </Link>
                <Link to={'/'}>
                    <IconsLibrary.Store />
                    <p>My Stores</p>
                </Link>
                <Link to={'/'}>
                    <IconsLibrary.Category />
                    <p>My Categories</p>
                </Link>
                <Link to={'/'}>
                    <IconsLibrary.Export />
                    <p>Export</p>
                </Link>
                <Link to={'/'}>
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
                <Link to={'/'}>
                    <IconsLibrary.User />
                    <p>Profile</p>
                </Link>
            </div>
            <div className={styles.authButton} onClick={()=> !isLoggedIn ? navigate('/auth') : goToProfile()}>
                <b>{isLoggedIn ? localStorage.getItem('username') : 'Login'}</b>
                {isLoggedIn ? <button onClick={logout}><IconsLibrary.Logout /></button> : <Link to={'/auth'}><IconsLibrary.Login /></Link>}
            </div>
            <button id={styles.closeButton} onClick={close}>Close</button>
        </div>
     );
}
 
export default Menu;