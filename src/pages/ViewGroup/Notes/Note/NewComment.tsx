import { useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import styles from './Note.module.css';
import { offlineCreate } from '../../../../services/offlineManager';
import { db } from '../../../../db';

const NewComment = ({noteId}: {noteId: string}) => {

    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNewComment = async () => {
        try {
            setIsLoading(true)
            const username = localStorage.getItem('username') ?? "Unkown";
            const commentData = {
                content: comment, 
                username,
                createdAt: new Date(),
                noteId,
                authorId: localStorage.getItem('userId') ?? 'local-user'
            }
            await offlineCreate(db.noteComments, commentData, 'CREATE_COMMENT')
            setComment('');
            setIsLoading(false);
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