import { useMemo, useState } from 'react';
import styles from './Notes.module.css';
import { IconsLibrary } from '../../../assets/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/LoadingSpinner/Loading';
import NewNote from './NewNote';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import Note from './Note';

const Notes = () => {
    const { groupId } = useParams();

    const navigate = useNavigate();


    const [showNewNote, setShowNewNote] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('active');

    const notes = useLiveQuery(
        () => db.notes.where({groupId}).toArray(), 
        [groupId]
    )

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
                    {filteredNotes?.length > 0 ? filteredNotes.map((note, index)=><Note data={note} key={index} />) : <p className='no-items-text'>There are no notes.</p>}
                </div>
            </div>
        );
    }
}
 
export default Notes;