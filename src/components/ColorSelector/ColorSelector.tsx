import { IconsLibrary } from '../../assets/icons';
import { COLORS } from './colors';
import styles from './ColorSelector.module.css';

interface ColorSelectorProps {
    close: ()=>void;
    setColor: (color: string) => void;
    currentColor: string;
}
const ColorSelector: React.FC<ColorSelectorProps> = ({close, setColor, currentColor}) => {



    return (
        <div className={styles.colorSelector}>
            <div className={styles.header}>
                <h1>Select a color</h1>
                <button onClick={close}><IconsLibrary.Close /></button>
            </div>
            <div className={styles.container}>
                {COLORS.map(color=><button className={currentColor === color ? styles.selectedColor : ''} onClick={()=>setColor(color)} key={color} style={{backgroundColor: color}}>{currentColor === color ? <IconsLibrary.Checkmark /> : null}</button>)}
            </div>
            <button onClick={close} className={styles.doneButton}>Done</button>
        </div>
    )
}

export default ColorSelector;