import { useState } from 'react';
import styles from './Notes.module.css';
import SwitchButton from '../../../components/SwitchButton/SwitchButton';
import { createNote } from '../../../services/notesServices';

interface NoteProps {
    close: ()=>void;
    groupId: string;
}
const NewNote: React.FC<NoteProps> = ({close, groupId}) => {

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
                    close();
                }
            } catch (error){
                console.error(error)
            }
        }
    }

    return (
        <div className={styles.newNote}>
            <h2>New Note</h2>
            <fieldset>
                <label>Note Title</label>
                <input type='text' name='title' value={title} onChange={(e)=>setTitle(e.target.value)} />
            </fieldset>
            <fieldset>
                <label>Note Content</label>
                <input type='text' name='content' value={content} onChange={(e)=>setContent(e.target.value)} />
                {contentError ? <p className={styles.error}>{contentError}</p> : null}
            </fieldset>
            <div className={styles.pin}>
                <p>Pin note?</p>
                <SwitchButton isActivated={isPinned} onPress={()=>setIsPinned(prev=>!prev)} />
            </div>
            <div className={styles.buttons}>
                <button onClick={close}>Close</button>
                <button onClick={handleAddNote}>Add Note</button>
            </div>
        </div>
    )
}

export default NewNote;