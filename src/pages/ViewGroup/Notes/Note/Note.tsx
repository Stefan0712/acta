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

interface NoteProps {
    data: INote;
}

const Note: React.FC<NoteProps> = ({data}) => {

    const {showNotification} = useNotifications();
    const [showComments, setShowComments] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const handleShowComments = () => {
        setShowComments(true);
    }
    const userId = localStorage.getItem('userId');
    const isAuthor = userId && userId === data.authorId;

        const restoreNote = async () =>{
        if(data._id) {
            try {
                await updateNote(data._id, {isDeleted: false});
                showNotification("Note restored", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to restore note.", "error");
            }
        }
    }

    const permanentlyDelete = async () =>{
        if(data._id) {
            try {
                await deleteNote(data._id);
                showNotification("Note deleted permanently", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
            }
        }
    }


    const handleDeleteNote = async () => {
        if(data._id) {
            try {
                await updateNote(data._id, {isDeleted: true});
                showNotification("Note deleted", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
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
                        <button onClick={permanentlyDelete}>
                            <IconsLibrary.Close />
                            <p>Delete Forever</p>
                        </button>
                        <button onClick={restoreNote}>
                            <IconsLibrary.Sync />
                            <p>Restore</p>
                        </button></> : <>
                        <button onClick={handleDeleteNote}>
                            <IconsLibrary.Delete />
                            <p>Delete</p>
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
