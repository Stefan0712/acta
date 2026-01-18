import { useState } from 'react';
import { deleteNote, updateNote } from '../../../../services/notesServices';
import styles from './Note.module.css';
import { useNotifications } from '../../../../Notification/NotificationContext';
import { IconsLibrary } from '../../../../assets/icons';
import { formatRelativeTime } from '../../../../helpers/dateFormat';
import type { Note as INote } from '../../../../types/models';
import NewComment from './NewComment';
import Comment from './Comment';
import EditNote from './EditNote';
import { Flag } from 'lucide-react';
import { db } from '../../../../db';

interface NoteProps {
    data: INote;
}

const Note: React.FC<NoteProps> = ({data}) => {

    const {showNotification} = useNotifications();
    const [showComments, setShowComments] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [processingDeletion, setProcessingDeletion] = useState(false);
    const [processingRestore, setProcessingRestore] = useState(false);

    const handleShowComments = () => {
        setShowComments(true);
    }
    const userId = localStorage.getItem('userId');
    const isAuthor = userId && userId === data.authorId;

    const restoreNote = async () =>{
        if(data._id) {
            setProcessingRestore(true);
            try {
                await updateNote(data._id, {isDeleted: false});
                await db.notes.update(data._id, {isDeleted: false})
                showNotification("Note restored", "success");
                setProcessingRestore(false);
            } catch (error) {
                console.error(error);
                showNotification("Failed to restore note.", "error");
                setProcessingRestore(false);
            }
        }
    }

    const permanentlyDelete = async () =>{
        if(data._id) {
            setProcessingDeletion(true);
            try {
                await deleteNote(data._id);
                await db.notes.delete(data._id)
                showNotification("Note deleted permanently", "success");
                setProcessingDeletion(false);
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
                setProcessingDeletion(false);
            }
        }
    }


    const handleDeleteNote = async () => {
        if(data._id) {
            setProcessingDeletion(true);
            try {
                await updateNote(data._id, {isDeleted: true});
                await db.notes.update(data._id, {isDeleted: true})
                showNotification("Note deleted", "success");
                setProcessingDeletion(false);
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
                setProcessingDeletion(false);
            }
        }
    }


    return (
        <div className={styles.note}>
            <div className={styles.noteHeader}>
                <div className={styles.userPfp}>
                    <p>{data.authorUsername ? data?.authorUsername.charAt(0).toUpperCase() : '?'}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <p className={styles.author}>{data.authorUsername ?? "Username not found"}</p>
                    <p className={styles.createdAt}>{formatRelativeTime(data.createdAt)}</p>
                </div>
                <button><Flag /></button>
            </div>    
            <h1>{!data.title || data.title.length < 1 ? "Untitled Note" : data.title}</h1>
            <p className={styles.content}>{data.content}</p>
            <div className={styles.meta}>
                {!data.isDeleted ? <div className={styles.commentsCount} onClick={handleShowComments}>
                    <IconsLibrary.Comment />
                    <p>View comments ({data?.comments?.length ?? 0})</p>
                </div> : null}

                {showEdit ? <EditNote noteId={data._id} close={()=>setShowEdit(false)} /> : null}
                {isAuthor ? <div className={styles.manageNote}>
                    {data.isDeleted ? <>
                        <button onClick={permanentlyDelete} disabled={processingDeletion}>
                            {processingDeletion ? <IconsLibrary.Spinner /> : <>
                                <IconsLibrary.Close />
                                <p>Delete Forever</p>
                            </>}
                        </button>
                        <button onClick={restoreNote} disabled={processingRestore}>
                            {processingRestore ? <IconsLibrary.Spinner /> : <>
                                <IconsLibrary.Sync />
                                <p>Restore</p>
                            </>}
                        </button></> : <>
                        <button onClick={handleDeleteNote} disabled={processingDeletion}>
                            {processingDeletion ? <IconsLibrary.Spinner /> : <>
                                <IconsLibrary.Delete />
                                <p>Delete</p>
                            </>}
                        </button>
                        <button onClick={()=>setShowEdit(true)}>
                            <IconsLibrary.Edit />
                            <p>Edit</p>
                        </button>
                    </>}
                </div> : null}
            </div>
            {showComments ? <NewComment noteId={data._id} /> : null }
            {showComments ? <div className={styles.comments}>
                {data && data.comments && data.comments?.length > 0 ? data.comments.map(item=><Comment key={item._id ?? item.content} data={item} />) : <p className='no-items-text'>No comments</p>}
            </div> : null}
        </div>
    )
}

export default Note;
