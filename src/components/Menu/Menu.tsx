import { Link } from 'react-router-dom';
import styles from './Menu.module.css';
import { IconsLibrary } from '../../assets/icons';


const Menu = ({close}: {close:()=>void}) => {
    return ( 
        <div className={styles.menu}>
            <h2>Menu</h2>
            <div className={styles.section}>
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
            <button id={styles.closeButton} onClick={close}>Close</button>
        </div>
     );
}
 
export default Menu;