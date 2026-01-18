import { useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import { db } from '../../../../db';
import { formatRelativeTime } from '../../../../helpers/dateFormat';
import { useNotifications } from '../../../../Notification/NotificationContext';
import { deleteComment } from '../../../../services/notesServices';
import type { NoteComment } from '../../../../types/models';
import styles from './Note.module.css';

const Comment = ({data}: {data: NoteComment}) => {

    const {showNotification} = useNotifications();
    const [showProcessingDelete, setShowProcessingDelete] = useState(false);

    const handleDeleteComment = async () => {
        try {
            setShowProcessingDelete(true)
            await deleteComment(data.noteId, data._id);
            db.noteComments.delete(data._id)
            showNotification('Comment deleted successfully', "success");
            setShowProcessingDelete(false);
        } catch ( error ) {
            console.error(error);
            setShowProcessingDelete(false);
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
            {data.authorId === localStorage.getItem('userId') ? <button onClick={handleDeleteComment} disabled={showProcessingDelete}>{showProcessingDelete ? <IconsLibrary.Spinner /> : <IconsLibrary.Delete />}</button> : null}
        </div>
    )
}

export default Comment;