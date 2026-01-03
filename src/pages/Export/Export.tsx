import { useEffect, useState } from 'react';
import styles from './Export.module.css';
import type { List, ListItem, Note, Tag } from '../../types/models';
import { IconsLibrary } from '../../assets/icons';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import Header from '../../components/Header/Header';



const Export = () => {

    const {showNotification} = useNotifications();

    const [fileName, setFileName] = useState(`export-${new Date().toISOString().slice(0, 10)}`)

    const [lists, setLists] = useState<List[]>([]);
    const [selectedLists, setSelectedLists] = useState<List[]>([]);
    const [expandLists, setExpandLists] = useState(false);

    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
    const [expandNotes, setExpandNotes] = useState(false);

    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [expandTags, setExpandTags] = useState(false);

    const getLists = async () => {
        try {
            const listsResponse = await db.lists.toArray();
            if(listsResponse && listsResponse.length > 0) {
                const itemsResponse: ListItem[] = await db.listItems.toArray();
                if(itemsResponse){
                    const updatedLists: List[] = listsResponse.map((list)=>(
                        {
                            ...list, 
                            items: itemsResponse.filter(item=>item.listId === list._id),
                            totalItemsCounter: itemsResponse.filter(item=>item.listId === list._id && !item.isDeleted).length, 
                            completedItemsCounter: itemsResponse.filter(item=>item.listId === list._id && item.isChecked && !item.isDeleted).length
                        }
                    )
                    )
                    setLists(updatedLists);
                }
            }

        }  catch (error) {
            console.error(error);
            showNotification("Failed to load local lists. Try again!", "error");
        }
    }
    const getTags = async () => {
        try {
            const tagsResponse = await db.tags.toArray();
            if(tagsResponse && tagsResponse.length > 0) {
                setTags(tagsResponse)
            }
        } catch (error) {
            console.error(error)
            showNotification("Failed to get tags. Try again", "error")
        }
    }
    useEffect(()=>{
        getLists();
        getTags();
    },[]);

    const toggleSelectList = (selectedList: List) => {
        if (selectedLists.some(item=>item._id === selectedList._id)){
            setSelectedLists(prev=>[...prev.filter(item=>item._id!==selectedList._id)])
        } else {
            setSelectedLists(prev=>[...prev, selectedList])
        }
    }
    const toggleSelectTag = (selectedTag: Tag) => {
        if (selectedTags.some(tag=>tag._id === selectedTag._id)){
            setSelectedTags(prev=>[...prev.filter(item=>item._id!==selectedTag._id)])
        } else {
            setSelectedTags(prev=>[...prev, selectedTag])
        }
    }
    const toggleSelectNote = (selectedNote: Note) => {
        if (selectedNotes.some(note=>note._id === selectedNote._id)){
            setSelectedNotes(prev=>[...prev.filter(item=>item._id!==selectedNote._id)])
        } else {
            setSelectedNotes(prev=>[...prev, selectedNote])
        }
    }
    const handleSelectAll = (areItemsSelected: boolean) => {
        if(areItemsSelected){
            setSelectedLists([]);
            setSelectedTags([]);
        } else {
            setSelectedLists(lists);
            setSelectedTags(tags);
        }
    }


    const handleExport = () => {
        const dataToExport = {
            exportedAt: new Date(),
            profileData: {
                username: localStorage.getItem('username'),
                userId: localStorage.getItem('userId'),
            },
            data: {
                lists,
                tags,
                notes
            }
        }
        const jsonString = JSON.stringify(dataToExport, null, 2);
        
        // Create a Blob
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Set the filename
        if(fileName.length > 0){
            link.download = `${fileName}.json`;
        } else {
            link.download = `export-${new Date().toISOString().slice(0, 10)}.json`;
        }
        
        // Append to body, trigger click, and cleanup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Data exported successfully!', "success");
    };


    const isAllSelected = lists.length > 0 && tags.length > 0 && lists.length === selectedLists.length && tags.length === selectedTags.length
    return (
        <div className={styles.export}>
            <Header title='Export' />
            <div className={styles.exportButtons}>
                <label>Select All</label>
                <button 
                    onClick={()=>handleSelectAll(isAllSelected)} 
                    className={`${styles.checkbox} ${isAllSelected ? styles.checked : ''}`} >{isAllSelected ? <IconsLibrary.Checkmark /> : null}</button>
            </div>
            <div className={styles.cardsContainer}>
                <fieldset>
                    <label>Export File Name</label>
                    <input value={fileName} onChange={(e)=>setFileName(e.target.value)} name='filename' />
                </fieldset>
                <div className={`${styles.category} ${expandLists ? styles.expandCategory : ''}`}>
                    <div className={styles.categoryTop}>
                        <div className={styles.iconContainer}>
                            <IconsLibrary.List2 />
                        </div>
                        <div className={styles.text}>
                            <h2>Lists</h2>
                            <p>{selectedLists.length}/{lists.length}</p>
                        </div>
                        <div 
                            className={`${styles.checkbox} ${lists.length > 0 && selectedLists.length === lists.length ? styles.checked : ''}`}
                            onClick={()=>lists.length === selectedLists.length ? setSelectedLists([]) : setSelectedLists([...lists])}
                        >
                            {lists.length > 0 && lists.length === selectedLists.length ? <IconsLibrary.Checkmark /> : null}
                        </div>
                        <button onClick={()=>setExpandLists(prev=>!prev)}>
                            <IconsLibrary.Arrow style={expandLists ? {transform: 'rotateZ(90deg)'} : {transform: 'rotateZ(-90deg)'}} />
                        </button>
                    </div>
                    {expandLists ? <div className={styles.container}>
                        {lists?.length > 0 ? lists.map(list=><div key={list._id} className={styles.list}>
                            <p>{list.name}</p>
                            <b>{list.completedItemsCounter}/{list.totalItemsCounter} items</b>
                            <button className={`${styles.checkbox} ${selectedLists.some(item=>item._id === list._id) ? styles.checked : ''}`} onClick={()=>toggleSelectList(list)}>
                                {selectedLists.some(item=>item._id === list._id) ? <IconsLibrary.Checkmark /> : null}
                            </button>
                        </div>) : <p className='no-items-text'>No lists to show</p>}
                    </div> : null}
                    
                </div>
                <div className={`${styles.category} ${expandTags ? styles.expandCategory : ''}`}>
                    <div className={styles.categoryTop}>
                        <div className={styles.iconContainer}>
                            <IconsLibrary.Tag />
                        </div>
                        <div className={styles.text}>
                            <h2>Tags</h2>
                            <p>{selectedTags.length}/{tags.length}</p>
                        </div>
                        <div 
                            className={`${styles.checkbox} ${tags.length > 0 && selectedTags.length === tags.length ? styles.checked : ''}`}
                            onClick={()=>tags.length === selectedTags.length ? setSelectedTags([]) : setSelectedTags([...tags])}
                        >
                            {tags.length > 0 && tags.length === selectedTags.length ? <IconsLibrary.Checkmark /> : null}
                        </div>
                        <button onClick={()=>setExpandTags(prev=>!prev)}>
                            <IconsLibrary.Arrow style={expandTags ? {transform: 'rotateZ(90deg)'} : {transform: 'rotateZ(-90deg)'}} />
                        </button>
                    </div>
                    {expandTags ? <div className={styles.container}>
                        {tags?.length > 0 ? tags.map(tag=><div key={tag._id} className={styles.tag}>
                            <p>{tag.name}</p>
                            <button className={`${styles.checkbox} ${selectedTags.some(item=>item._id === tag._id) ? styles.checked : ''}`} onClick={()=>toggleSelectTag(tag)}>
                                {selectedTags.some(item=>item._id === tag._id) ? <IconsLibrary.Checkmark /> : null}
                            </button>
                        </div>) : <p className='no-items-text'>No tags to show</p>}
                    </div> : null}
                </div>
                <div className={`${styles.category} ${expandNotes ? styles.expandCategory : ''}`}>
                    <div className={styles.categoryTop}>
                        <div className={styles.iconContainer}>
                            <IconsLibrary.Note />
                        </div>
                        <div className={styles.text}>
                            <h2>Notes</h2>
                            <p>{selectedNotes.length}/{notes.length}</p>
                        </div>
                        <div 
                            className={`${styles.checkbox} ${selectedNotes.length === notes.length && notes.length > 0 ? styles.checked : ''}`}
                            onClick={()=>notes.length === selectedNotes.length ? setSelectedNotes([]) : setSelectedNotes([...notes])}
                        >
                            {notes.length === selectedNotes.length && notes.length > 0 ? <IconsLibrary.Checkmark /> : null}
                        </div>
                        <button onClick={()=>setExpandNotes(prev=>!prev)}>
                            <IconsLibrary.Arrow style={expandNotes ? {transform: 'rotateZ(90deg)'} : {transform: 'rotateZ(-90deg)'}} />
                        </button>
                    </div>
                    {expandNotes ? <div className={styles.container}>
                        {notes?.length > 0 ? notes.map(note=><div key={note._id} className={styles.tag}>
                            <p>{note.title}</p>
                            <button className={`${styles.checkbox} ${selectedNotes.some(item=>item._id === note._id) ? styles.checked : ''}`} onClick={()=>toggleSelectNote(note)}>
                                {selectedNotes.some(item=>item._id === note._id) ? <IconsLibrary.Checkmark /> : null}
                            </button>
                        </div>) : <p className='no-items-text'>No notes to show</p>}
                    </div> : null}
                </div>
            </div>
            <button className={styles.confirmButton} onClick={handleExport}>Export</button>
        </div>
    )
}

export default Export;