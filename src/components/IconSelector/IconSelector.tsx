import { IconsLibrary } from '../../assets/icons';
import { getIcon, GROUP_ICONS } from './iconCollection';
import styles from './IconSelector.module.css';

interface IconSelectorProps {
    close: ()=>void;
    icon: string;
    setIcon: (id: string)=>void;
}
const IconSelector: React.FC<IconSelectorProps> = ({close, icon, setIcon}) => {

    const selectIcon = (iconId: string) =>{
        setIcon(iconId);
        close();
    }
    return (
        <div className={styles.iconSelector}>
            <div className={styles.header}>
                <b>Select Icon</b>
                <button onClick={close}>
                    <IconsLibrary.Close />
                </button>
            </div>
            <div className={styles.iconsContainer}>
                {GROUP_ICONS.map(item=>{
                    const Icon = getIcon(item.id);
                    return <div key={item.id} className={`${styles.icon} ${icon === item.id ? styles.selectedIcon : ''}`} onClick={()=>selectIcon(item.id)}>
                        <Icon />
                    </div>}
                )}
            </div>
        </div>
    )
}

export default IconSelector;