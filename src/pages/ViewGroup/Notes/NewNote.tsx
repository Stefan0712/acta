import { useState } from 'react';
import styles from './Notes.module.css';
import SwitchButton from '../../../components/SwitchButton/SwitchButton';
import { createNote } from '../../../services/notesServices';

interface NoteProps {
    groupId: string;
    close: ()=>void;
}
const NewNote: React.FC<NoteProps> = ({groupId, close}) => {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [contentError, setContentError] = useState<string | null>(null);



    const handleAddNote = async () => {
        if (!content || content.length < 1 || content.length > 10000){
            setContentError("Note should be between 0 and 10000 characters.")
        } else if(groupId) {
            const newNote = {
                title: title ?? 'Untitled Note',
                content,
                isPinned,
                groupId,
                isDeleted: false,
                authorUsername: localStorage.getItem('username') ?? 'Local user'
            }
            try {
                const apiResponse = await createNote(newNote);
                if(apiResponse) {
                    console.log(apiResponse)
                }
            } catch (error){
                console.error(error)
            }
        }
    }

    return (
        <div className={`${styles.newNote}`}>
            <input type='text' name='title' value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='New Note Title...'/>
            <input type='text' name='content' value={content} onChange={(e)=>setContent(e.target.value)} placeholder='Note Content...'/>
            {contentError ? <p className={styles.error}>{contentError}</p> : null}
            <div className={styles.newNoteButtons}>
                <div className={styles.pin}>
                    <p>Pin note?</p>
                    <SwitchButton isActivated={isPinned} onPress={()=>setIsPinned(prev=>!prev)} />
                </div>
                <button className={styles.closeButton} onClick={close}>Close</button>
                <button className={styles.addNoteButton} onClick={handleAddNote}>Add Note</button>
            </div>
        </div>
    )
}

export default NewNote;