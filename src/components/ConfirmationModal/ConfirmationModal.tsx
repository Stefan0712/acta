import styles from './ConfirmationModal.module.css';

interface ConfirmatinoModalProps {
    cancel: () => void;
    confirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmatinoModalProps> = ({cancel, confirm}) => {
    return ( 
       <div className={styles.modalBg}>
            <div className={styles.confirmationModal}>
                <h3>Delete list?</h3>
                <h4>Are you sure you want to delete this list?</h4>
                <div className={styles.buttons}>
                    <button onClick={cancel}>Cancel</button>
                    <button onClick={confirm}>Confirm</button>
                </div>
            </div>
       </div>
     );
}
 
export default ConfirmationModal;