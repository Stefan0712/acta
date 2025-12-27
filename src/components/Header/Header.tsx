import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { IconsLibrary } from '../../assets/icons';


interface HeaderProps {
    prevUrl?: string;
    title: string;
    Button?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({prevUrl, title, Button}) => {

    const navigate = useNavigate();


    return (
        <div className={styles.header}>
            {prevUrl ? <Link to={prevUrl}><IconsLibrary.BackArrow /></Link> : <button onClick={()=>navigate(-1)}><IconsLibrary.BackArrow /></button>}
            <h1>{title}</h1>
            {Button ? <div className={styles.buttonContainer}>{Button}</div> : null}
        </div>
    )
}

export default Header;