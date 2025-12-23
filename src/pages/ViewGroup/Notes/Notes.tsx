import { useEffect, useMemo, useState } from 'react';
import styles from './Notes.module.css';
import type { Note, NoteComment } from '../../../types/models';
import { IconsLibrary } from '../../../assets/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../../Notification/NotificationContext';
import Auth from '../../Auth/Auth';
import Loading from '../../../components/LoadingSpinner/Loading';
import { createComment, deleteComment, deleteNote, getNoteComments, getNotesByGroup, updateNote } from '../../../services/notesServices';
import NewNote from './NewNote';
import { formatRelativeTime } from '../../../helpers/dateFormat';
import EditNote from './EditNote';


const Notes = () => {
    const { groupId } = useParams();

    const {showNotification} = useNotifications();
    const navigate = useNavigate();


    const [showNewNote, setShowNewNote] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('active');
    
    useEffect(()=>{
        getNotes();
    },[]);

    const getNotes = async () => {
        if (groupId){
            try {
                const apiResponse = await getNotesByGroup(groupId);
                setNotes(apiResponse); 
            } catch (apiError) {
                console.error("API pull failed:", apiError);
                showNotification("Offline or server issue.", "error");
            } finally {
                setIsLoading(false); 
            }
        }
    };

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

    const handleEditNote = (noteId: string, updates: Partial<Note>) => {
        setNotes((prev)=>
            prev.map(note => note._id === noteId ? { ...note, ...updates } : note)
        )
    }
    if (!localStorage.getItem('jwt-token') && groupId) {
        return ( <Auth /> )
    } else if(isLoading) {
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
                <div className={styles.filters}>
                    <button onClick={()=>setSelectedFilter('active')} className={selectedFilter === 'active' ? styles.selectedFilter : ''}>Active</button>
                    <button onClick={()=>setSelectedFilter('pinned')} className={selectedFilter === 'pinned' ? styles.selectedFilter : ''}>Pinned</button>
                    <button onClick={()=>setSelectedFilter('deleted')} className={selectedFilter === 'deleted' ? styles.selectedFilter : ''}>Deleted</button>
                </div>
                <div className={styles.notesContainer}>
                    {showNewNote && groupId ? <NewNote close={()=>setShowNewNote(false)} addNote={(newNote)=>setNotes(prev=>[...prev, newNote])} groupId={groupId} /> : null}
                    {showNewNote ? null : <button onClick={()=>setShowNewNote(true)} className={styles.newNoteButton}>
                        <IconsLibrary.Plus />
                    </button>}
                    {filteredNotes?.length > 0 ? filteredNotes.map((note, index)=><Note handleEditNote={handleEditNote} data={note} key={index} />) : <p className='no-items-text'>There are no notes.</p>}
                </div>
            </div>
        );
    }
}
    

 
export default Notes;

interface NoteProps {
    data: Note;
    handleEditNote: (noteId: string, note: Partial<Note>) => void;
}

const Note: React.FC<NoteProps> = ({data, handleEditNote}) => {
    const {showNotification} = useNotifications();

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<NoteComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);

    const restoreNote = async () =>{
        if(data._id) {
            try {
                await updateNote(data._id, {isDeleted: false});
                handleEditNote(data._id, {isDeleted: false});
                showNotification("Note restored", "success");
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
                handleEditNote(data._id, {isDeleted: true});
                showNotification("Note deleted permanently", "success");
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
            }
        }
    }

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
    const handleDeleteNote = async () => {
        if(data._id) {
            try {
                await updateNote(data._id, {isDeleted: true});
                handleEditNote(data._id, {isDeleted: true});
                showNotification("Note deleted", "success");
            } catch (error) {
                console.error(error);
                showNotification("Failed to delete Note.", "error");
            }
        }
    }
    const removeComment = (id: string) => {
        setComments(prev=>[...prev.filter(item=>item._id !== id)]);
    }
    return (
        <div className={styles.note}>
            {showEdit ? <EditNote noteId={data._id} close={()=>setShowEdit(false)} editNote={handleEditNote}  /> : null}
            <div className={styles.noteHeader}>
                <h1>{!data.title || data.title.length < 1 ? "Untitled Note" : data.title}</h1>
                <p>{formatRelativeTime(data.createdAt)}</p>
            </div>    
            <p className={styles.content}>{data.content}</p>
            <div className={styles.meta}>
                <p className={styles.author}>{data.authorUsername ?? ""}</p>
                <div className={styles.manageButtons}>
                    {localStorage.getItem('userId') === data.authorId ? <div className={styles.noteButtons}>
                    <button onClick={()=>setShowEdit(true)}><IconsLibrary.Edit />  Edit</button>
                    {data.isDeleted ? <button style={{color: 'red'}} onClick={permanentlyDelete}><IconsLibrary.Close />  Permamently Delete</button> : null}
                    {data.isDeleted ? <button onClick={restoreNote}><IconsLibrary.Sync />  Restore</button> : null}
                    {!data.isDeleted ? <button onClick={handleDeleteNote}><IconsLibrary.Delete /> Delete</button> : null }
                </div> : null}
                </div>
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