import { useMemo, useState } from 'react';
import styles from './Notes.module.css';
import { IconsLibrary } from '../../../assets/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/LoadingSpinner/Loading';
import NewNote from './NewNote';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import Note from './Note/Note';
import type { Note as INote, NoteComment } from '../../../types/models';

const Notes = () => {
    const { groupId } = useParams();

    const navigate = useNavigate();


    const [showNewNote, setShowNewNote] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('active');

    const notes = useLiveQuery(async () => {
        if(groupId) {
            // Fetch all notes for this group
            const notes = await db.notes
                .where('groupId').equals(groupId)
                .toArray();

            if (notes.length === 0) return [];

            // Fetch all comments for these notes
            const noteIds = notes.map(n => n._id);
            const allComments = await db.noteComments
                .where('noteId').anyOf(noteIds)
                .toArray();

            // Join them
            const commentsMap = new Map<string, NoteComment[]>();
            
            allComments.forEach(c => {
                const existing = commentsMap.get(c.noteId) || [];
                existing.push(c);
                commentsMap.set(c.noteId, existing);
            });

            // Return the combined structure
            const combined = notes.map(note => ({
                ...note,
                comments: commentsMap.get(note._id) || []
            }));

            return combined;
        } else {
            return []
        }
    }, [groupId]);


    const filteredNotes = useMemo(() => {
        if (!notes) return [];

        return notes.filter((note: INote) => {
            switch (selectedFilter) {
                case 'active':
                    return !note.isDeleted;
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
            <div className='h-full w-full px-2'>
                {groupId && showNewNote ? <NewNote close={()=>setShowNewNote(false)} groupId={groupId} /> : <div/>}
                <div className='w-full grid grid-cols-[1fr_auto] gap-2 mb-2'>
                    <div className='p-1 w-fit ml-2 flex gap-2 items-center'>
                        <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'active' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('active')}>Active</button>
                        <button className={`px-2 py-1 border-1 border-white/50 rounded-full text-white text-sm ${selectedFilter === 'deleted' ? 'bg-yellow-500 border-yellow-500 text-zinc-900' : ''}`} onClick={()=>setSelectedFilter('deleted')}>Deleted</button>
                    </div>
                    <button onClick={()=>setShowNewNote(true)} className='text-white/80 flex items-center gap-2'>
                        <IconsLibrary.Plus />
                    </button>
                </div>
                <div className={styles.notesContainer}>
                    {filteredNotes?.length > 0 ? filteredNotes.map((note: INote, index: number)=><Note data={note} key={index} />) : <p className='no-items-text'>There are no notes.</p>}
                </div>
            </div>
        );
    }
}
 
export default Notes;