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
            <Link to={'/lists'} onClick={()=>setShowMenu(false)}>
                <IconsLibrary.Lists />
                <p>Lists</p>
            </Link>
            <Link to={'/groups'} onClick={()=>setShowMenu(false)}>
                <IconsLibrary.Group />
                <p>Groups</p>
            </Link>
            <Link to={'/notifications'} onClick={()=>setShowMenu(false)}>
                <IconsLibrary.Bell />
                <p>Notifications</p>
            </Link>
            <button onClick={()=>setShowMenu(prev=>!prev)}>
                {showMenu ? <IconsLibrary.Close /> : <IconsLibrary.Menu />}
                <p>{showMenu ? 'Close' : 'Menu'}</p>
            </button>
        </div>
    );
}
 
export default Navigation;