import { useState } from 'react';
import { deleteNote, getNoteComments, updateNote } from '../../../services/notesServices';
import EditNote from './EditNote';
import styles from './Notes.module.css';
import { useNotifications } from '../../../Notification/NotificationContext';
import { IconsLibrary } from '../../../assets/icons';
import { formatRelativeTime } from '../../../helpers/dateFormat';
import type { Note as INote, NoteComment } from '../../../types/models';
import NewComment from './NewComment';
import Comment from './Comment';

interface NoteProps {
    data: INote;
}

const Note: React.FC<NoteProps> = ({data}) => {

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<NoteComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPostMenu, setShowPostMenu] = useState(false);

    
    const getComments = async () => {
        try {
            const apiResponse = await getNoteComments(data._id);
            if(apiResponse){
                setComments(apiResponse);
                setIsLoading(false);
                console.log(apiResponse);
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }
    const handleShowComments = () => {
        getComments();
        setShowComments(true);
    }
    const removeComment = (id: string) => {
        setComments(prev=>[...prev.filter(item=>item._id !== id)]);
    }
    const userId = localStorage.getItem('userId');
    const isAuthor = userId && userId === data.authorId;
    return (
        <div className={styles.note}>
            {showPostMenu && isAuthor ? <PostMenu 
                close={()=>setShowPostMenu(false)}
                noteId={data._id}
                isDeleted={data.isDeleted}
            /> : null}
            <div className={styles.noteHeader}>
                <div className={styles.userPfp}>
                    <p>{data.authorUsername ? data?.authorUsername.charAt(0).toUpperCase() : '?'}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <p className={styles.author}>{data.authorUsername ?? ""}</p>
                    <p className={styles.createdAt}>{formatRelativeTime(data.createdAt)}</p>
                </div>
                {isAuthor ? <button onClick={()=>setShowPostMenu(true)}>
                    <IconsLibrary.Dots />
                </button> : null}
                
            </div>    
            <h1>{!data.title || data.title.length < 1 ? "Untitled Note" : data.title}</h1>
            <p className={styles.content}>{data.content}</p>
            <div className={styles.meta}>
                {!data.isDeleted ? <div className={styles.commentsCount} onClick={handleShowComments}>
                    <IconsLibrary.Comment />
                    <p>{data.commentCount ?? 0}</p>
                </div> : null}
            </div>
            {showComments ? <NewComment noteId={data._id} addComment={(newComment)=>setComments(prev=>[...prev, newComment])} /> : null }
            {showComments ? <div className={styles.comments}>
                {isLoading ? <p>Loading comments...</p> : comments?.length > 0 ? comments.map(item=><Comment removeComment={removeComment} data={item} />) : <p>No comments to show</p>}
            </div> : null}
        </div>
    )
}

export default Note;

interface PostMenuProps {
    noteId: string;
    isDeleted: boolean;
    close: ()=> void;
}

const PostMenu: React.FC<PostMenuProps> = ({noteId, isDeleted, close}) => {


    const {showNotification} = useNotifications();
    const [showEdit, setShowEdit] = useState(false);

    const restoreNote = async () =>{
        if(noteId) {
            try {
                await updateNote(noteId, {isDeleted: false});
                showNotification("Note restored", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to restore note.", "error");
            }
        }
    }

    const permanentlyDelete = async () =>{
        if(noteId) {
            try {
                await deleteNote(noteId);
                showNotification("Note deleted permanently", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
            }
        }
    }


    const handleDeleteNote = async () => {
        if(noteId) {
            try {
                await updateNote(noteId, {isDeleted: true});
                showNotification("Note deleted", "success");
                close();
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
            }
        }
    }

    return (
        <div className={styles.postMenu}>

            {showEdit ? <EditNote noteId={noteId} close={()=>setShowEdit(false)} /> : null}

            <button onClick={()=>setShowEdit(true)}>Edit</button>
            {isDeleted ? <button style={{color: 'red'}} onClick={permanentlyDelete}>Permamently Delete</button> : null}
            {isDeleted ? <button onClick={restoreNote}>Restore</button> : null}
            {!isDeleted ? <button onClick={handleDeleteNote}>Delete</button> : null }
            <button onClick={close}>Close</button>
        </div>
    )
}