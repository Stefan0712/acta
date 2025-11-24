import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';
import { useState } from 'react';
import Menu from '../Menu/Menu';
import { IconsLibrary } from '../../assets/icons';

const Navigation = () => {

    const [showMenu, setShowMenu] = useState(false);


    return ( 
        <div className={styles.navigation}>
            {showMenu ? <Menu close={()=>setShowMenu(false)} /> : null}
            <Link to={'/'}>
                <IconsLibrary.Lists />
                <p>Lists</p>
            </Link>
            <Link to={'/groups'}>
                <IconsLibrary.Group />
                <p>Groups</p>
            </Link>
            <Link to={'/notifications'}>
                <IconsLibrary.Collection />
                <p>Notifications</p>
            </Link>
            <button onClick={()=>setShowMenu(prev=>!prev)}>
                <IconsLibrary.Menu />
                <p>Menu</p>
            </button>
        </div>
    );
}
 
export default Navigation;