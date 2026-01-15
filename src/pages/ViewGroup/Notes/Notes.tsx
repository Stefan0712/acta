import { useMemo, useState } from 'react';
import styles from './Notes.module.css';
import type { Note, NoteComment } from '../../../types/models';
import { IconsLibrary } from '../../../assets/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../../Notification/NotificationContext';
import Loading from '../../../components/LoadingSpinner/Loading';
import { createComment, deleteComment, deleteNote, getNoteComments, updateNote } from '../../../services/notesServices';
import NewNote from './NewNote';
import { formatRelativeTime } from '../../../helpers/dateFormat';
import EditNote from './EditNote';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';

// TODO: Add a delete confirmation modal
// TODO: Write a function to remove the local copy of a freshly deleted note from the API
// TODO: Add a background blur to the New Note modal

const Notes = () => {
    const { groupId } = useParams();

    const navigate = useNavigate();


    const [showNewNote, setShowNewNote] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('active');

    const notes = useLiveQuery(async () => {
        return await db.notes.where({groupId}).toArray()
    }, [groupId])

    const filteredNotes = useMemo(() => {
        if (!notes) return [];

        return notes.filter(note => {
            switch (selectedFilter) {
                case 'active':
                    return !note.isDeleted;
                case 'pinned':
                    return !note.isDeleted && note.isPinned;
                case 'deleted':
                    return note.isDeleted === true;
                default:
                    return false;
            }
        });
    }, [notes, selectedFilter]);


    if (!localStorage.getItem('jwt-token') && groupId) {
        navigate('/auth')
    } else if(!notes) {
        return ( <Loading /> )
    } else if (notes) {
        return ( 
            <div className={styles.notes} style={!groupId ? {gridTemplateRows: 'var(--page-header-height) 40px 1fr'} : {}}>
                {!groupId ? 
                    <div className={styles.header}>
                        <button onClick={()=>navigate(-1)}><IconsLibrary.BackArrow fill='white'/></button>
                        <h3>My Notes</h3>
                        <button><IconsLibrary.Bell /></button>
                    </div> 
                : null}
                <select className='category-selector' value={selectedFilter} onChange={(e)=>setSelectedFilter(e.target.value)}>
                    <option value={'active'}>Active</option>
                    <option value={'pinned'}>Pinned</option>
                    <option value={'deleted'}>Deleted</option>
                </select>
                <div className={styles.notesContainer}>
                    {showNewNote && groupId ? <NewNote close={()=>setShowNewNote(false)}  groupId={groupId} /> : null}
                    {showNewNote ? null : <button onClick={()=>setShowNewNote(true)} className={styles.newNoteButton}>
                        <IconsLibrary.Plus />
                    </button>}
                    {filteredNotes?.length > 0 ? filteredNotes.map((note: Note, index: number)=><Note data={note} key={index} />) : <p className='no-items-text'>There are no notes.</p>}
                </div>
            </div>
        );
    }
}
    

 
export default Notes;

interface NoteProps {
    data: Note;
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
const NewComment = ({noteId, addComment}: {noteId: string, addComment: (newComment: NoteComment) => void}) => {

    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNewComment = async () => {
        try {
            setIsLoading(true)
            const newComment = {
                username: localStorage.getItem('username') ?? "No username",
                content: comment,
            }
            const apiResponse = await createComment(noteId, newComment);
            if (apiResponse){
                addComment(apiResponse);
                setComment('');
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.newComment}>
            <input type='text' value={comment} onChange={(e)=>setComment(e.target.value)} placeholder='Comment something about this...' />
            <button onClick={handleNewComment} disabled={isLoading}><IconsLibrary.BackArrow style={{transform: 'rotateZ(180deg)'}} /></button>
        </div>
    )
}