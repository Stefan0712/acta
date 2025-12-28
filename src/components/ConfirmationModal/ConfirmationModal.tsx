import styles from './ConfirmationModal.module.css';

interface ConfirmatinoModalProps {
    cancel: () => void;
    confirm: () => void;
    title?: string;
    content?: string;
}

const ConfirmationModal: React.FC<ConfirmatinoModalProps> = ({cancel, confirm, title, content}) => {
    return ( 
       <div className={styles.modalBg}>
            <div className={styles.confirmationModal}>
                <h3>{title ?? "Are you sure?"}</h3>
                <h4>{content ?? "Are you sure you want to do this?"}</h4>
                <div className={styles.buttons}>
                    <button onClick={cancel}>Cancel</button>
                    <button onClick={confirm}>Confirm</button>
                </div>
            </div>
       </div>
     );
}
 
export default ConfirmationModal;