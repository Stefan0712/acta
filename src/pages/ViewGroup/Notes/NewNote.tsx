import { useState } from 'react';
import styles from './Notes.module.css';
import SwitchButton from '../../../components/SwitchButton/SwitchButton';
import { createNote } from '../../../services/notesServices';
import { ObjectId } from 'bson';

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
                _id: new ObjectId().toHexString(),
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
        <div className='w-full p-4 rounded-xl flex flex-col gap-2 bg-zinc-900 text-white mb-2 border border-white/10'>
            <input type='text' name='title' value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='New Note Title...' className='rounded-lg border border-white/5 bg-zinc-950 px-2 py-4 text-sm'/>
            <input type='text' name='content' value={content} onChange={(e)=>setContent(e.target.value)} placeholder='Note Content...' className='rounded-lg border border-white/5 bg-zinc-950 px-2 py-4 text-sm'/>
            {contentError ? <p className={styles.error}>{contentError}</p> : null}
            <div className='w-full flex items-center gap-2 mt-2'>
                <div className="flex items-center gap-2 mr-auto">
                    <p>Pin note?</p>
                    <SwitchButton isActivated={isPinned} onPress={()=>setIsPinned(prev=>!prev)} />
                </div>
                <button className='text-sm text-white/60' onClick={close}>Cancel</button>
                <button className='px-2 py-1 bg-yellow-500 rounded-lg text-black' onClick={handleAddNote}>Add Note</button>
            </div>
        </div>
    )
}

export default NewNote;