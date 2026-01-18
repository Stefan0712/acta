import { IconsLibrary } from '../../../assets/icons';
import { formatRelativeTime } from '../../../helpers/dateFormat';
import { useNotifications } from '../../../Notification/NotificationContext';
import { deleteComment } from '../../../services/notesServices';
import type { NoteComment } from '../../../types/models';
import styles from './Notes.module.css';

const Comment = ({data, removeComment}: {data: NoteComment, removeComment: (_id: string) => void}) => {

    const {showNotification} = useNotifications();

    const handleDeleteComment = async () => {
        try {
            await deleteComment(data.noteId, data._id);
            removeComment(data._id)
            showNotification('Comment deleted successfully', "success");
        } catch ( error ) {
            console.error(error);
        }
    }

    return (
        <div className={styles.comment}>
            <div className={styles.commentContent}>
                <div className={styles.topRow}>
                    <b>{data.username}</b>
                    <p className={styles.timestamp}>{formatRelativeTime(data.createdAt)}</p>
                </div>
                <p>{data.content}</p>
            </div>
            {data.authorId === localStorage.getItem('userId') ? <button onClick={handleDeleteComment}><IconsLibrary.Delete /></button> : null}
        </div>
    )
}

export default Comment;