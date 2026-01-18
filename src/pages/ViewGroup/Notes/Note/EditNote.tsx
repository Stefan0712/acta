import { useEffect, useState } from 'react';
import styles from './Note.module.css';
import SwitchButton from '../../../../components/SwitchButton/SwitchButton';
import { getNote, updateNote } from '../../../../services/notesServices';

interface EditNoteProps {
    close: ()=>void;
    noteId: string;
}
const EditNote: React.FC<EditNoteProps> = ({close, noteId}) => {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [contentError, setContentError] = useState<string | null>(null);


    const handleGetNote = async () =>{
        try {
            const response = await getNote(noteId);
            console.log(response)
            if(response){
                setTitle(response.title ?? '');
                setContent(response.content ?? '');
                setIsPinned(response.isPinned ?? false);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(()=>{
        handleGetNote();
    },[]);

    const handleEditNote = async () => {
        if (!content || content.length < 1 || content.length > 10000){
            setContentError("Note should be between 0 and 10000 characters.")
        } else if(noteId) {
            const updates = {
                title: title ?? 'Untitled Note',
                content,
                isPinned
            }
            try {
                const apiResponse = await updateNote(noteId, updates);
                if(apiResponse) {
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
                <button onClick={handleEditNote}>Save</button>
            </div>
        </div>
    )
}

export default EditNote;