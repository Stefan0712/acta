import { useEffect, useMemo, useState } from 'react';
import type { Tag } from '../../types/models';
import styles from './TagSelector.module.css';
import { IconsLibrary } from '../../assets/icons';
import { db } from '../../db';
import { ObjectId } from 'bson';
import SwitchButton from '../SwitchButton/SwitchButton';


interface TagSelectorProps {
    tags: Tag[];
    addTag: (newTag: Tag)=>void;
    close: ()=>void;
    removeTag: (id: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({close, tags, addTag, removeTag})  => {

    const [name, setName] = useState('');
    const [existingTags, setExistingTags] = useState<Tag[]>([]);
    const [saveTag, setSaveTag] = useState(true);
    const [nameError, setNameError] = useState<null | string>(null)

    const getExistingTags = async () => {
        try {
            const dbResponse = await db.tags.toArray();
            if(dbResponse) {
                setExistingTags(dbResponse);
            }
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(()=>{
        getExistingTags();
    },[]);

    const results = useMemo(()=>{
        return existingTags.filter(tag=>tag.name.toLowerCase().includes(name.toLowerCase()));
    }, [existingTags, name])

    const handleSaveTag = async () => {
        if(name && name.length < 20 && name.length > 0){
            const newTag = {
                _id: new ObjectId().toString(),
                name
            };
            addTag(newTag);
            setExistingTags(prev=>[...prev, newTag]);
            if(saveTag) {
                try {
                    await db.tags.add(newTag);
                } catch (error) {
                    console.error(error)
                }
            }
            setName('');
        } else {
            setNameError('Tag is invalid. Should be between 1 and 25 characters');
        }
    }
    const handleNameInput = (value: string) => {
        setName(value);
        setNameError(null);
    }
    return (
        <div className={styles.tagSelector}>
            <div className={styles.header}>
                <h1>Tags</h1>
                <button onClick={close}>
                    <IconsLibrary.Close />
                </button>
            </div>
            <div className={styles.tagsContainer}>
                {results?.length > 0 ? results.map(tag=><Tag addTag={addTag} removeTag={removeTag} isSelected={tags.some(item=>item._id===tag._id)} key={tag._id} tag={tag} />) : <p className='no-items-text'>No tags found</p>}
            </div>
            <div className={styles.newTag}>
                <div className={styles.toggle}>
                    <label>Save tag</label>
                    <SwitchButton isActivated={saveTag} onPress={()=>setSaveTag(prev=>!prev)} />
                </div>
                <div className={styles.inputs}>
                    <input type='text' value={name} onChange={(e)=>handleNameInput(e.target.value)} placeholder='Tag...' />
                    <button onClick={handleSaveTag}><IconsLibrary.Plus /></button>
                </div>
                {nameError ? <p className='error-message'>{nameError}</p> : null}
            </div>
        </div>
    )
    
}

export default TagSelector;

interface TagProps {
    tag: Tag;
    isSelected: boolean;
    removeTag: (id: string) => void;
    addTag: (tag: Tag) => void;
}
const Tag: React.FC<TagProps> = ({tag, isSelected, removeTag, addTag}) => {

    return (
        <div className={styles.tag}>
            <h2>{tag.name}</h2>
            {isSelected ? <button onClick={()=>removeTag(tag._id)}><IconsLibrary.Checkmark /></button> : <button onClick={()=>addTag(tag)}><IconsLibrary.Plus /></button>}
        </div>
    )
}