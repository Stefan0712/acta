import { useState } from 'react';
import { IconsLibrary } from '../../../assets/icons';
import { createComment } from '../../../services/notesServices';
import styles from './Notes.module.css';
import type { NoteComment } from '../../../types/models';

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

export default NewComment