import { useState } from 'react';
import styles from '../Export/Export.module.css';
import type { List, Note, Tag } from '../../types/models';
import { IconsLibrary } from '../../assets/icons';
import { db } from '../../db';
import { useNotifications } from '../../Notification/NotificationContext';
import Header from '../../components/Header/Header';
import { Folder } from 'lucide-react';
import { getDateAndHour } from '../../helpers/dateFormat';


interface ImportMeta {
    username: string;
    cretedAt: Date;
}

const Import = () => {

    const {showNotification} = useNotifications();

    const [showWarning, setShowWarning] = useState(false);

    const [importMeta, setImportMeta] = useState<null | ImportMeta>();

    const [lists, setLists] = useState<(List & {status: 'new' | 'conflict'})[]>([]);
    const [selectedLists, setSelectedLists] = useState<List[]>([]);
    const [expandLists, setExpandLists] = useState(false);

    const [notes, setNotes] = useState<(Note & {status: 'new' | 'conflict'})[]>([]);
    const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
    const [expandNotes, setExpandNotes] = useState(false);

    const [tags, setTags] = useState<(Tag & {status: 'new' | 'conflict'})[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [expandTags, setExpandTags] = useState(false);

    const saveLists = async () => {
        try {
            await db.lists.bulkPut(selectedLists);
            const itemsToSave = selectedLists.flatMap(list => list.items || []);
            await db.listItems.bulkPut(itemsToSave);
        }  catch (error) {
            console.error(error);
            showNotification("Failed to save lists. Try again!", "error");
        }
    }
    const saveTags = async () => {
        try {
            await db.tags.bulkPut(selectedTags);
        } catch (error) {
            console.error(error)
            showNotification("Failed to save tags. Try again", "error")
        }
    }

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


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
        try {
            const fileContent = event.target?.result as string;
            
            const jsonData = JSON.parse(fileContent);
            const [preparedNotes, preparedLists, preparedTags] = await Promise.all([
                prepareImportData(jsonData.data.notes as Note[], db.notes),
                prepareImportData(jsonData.data.lists as List[], db.lists),
                prepareImportData(jsonData.data.tags as Tag[], db.tags)
            ]);

            if(preparedLists?.length > 0){
                setLists(preparedLists);
            }
            if(preparedTags?.length > 0){
                setTags(preparedTags);
            }
            if(preparedNotes?.length > 0){
                setNotes(preparedNotes);
            }
            if(jsonData.exportedAt && jsonData.profileData.username) {
                setImportMeta({username: jsonData.profileData.username, cretedAt: jsonData.exportedAt});
            }
            setShowWarning(true);
                

            console.log("Imported Data:", jsonData);
            
            showNotification("File loaded successfully!", "success")

            } catch (error) {
                console.error("Error parsing JSON:", error);
                showNotification("Invalid JSON file", "error");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleImport = () => {
        saveLists();
        saveTags();
        showNotification(`Successfully imported ${selectedLists.length} lists and ${selectedTags.length} tags`, "success")
    }

    const isAllSelected = lists.length > 0 && tags.length > 0 && lists.length === selectedLists.length && tags.length === selectedTags.length
    return (
        <div className={styles.import}>
            <Header title='Import' />
            <div className={styles.exportButtons}>
                <label>Select All</label>
                <button 
                    onClick={()=>handleSelectAll(isAllSelected)} 
                    className={`${styles.checkbox} ${isAllSelected ? styles.checked : ''}`} >{isAllSelected ? <IconsLibrary.Checkmark /> : null}</button>
            </div>
            <label className={styles.customFileInput}>
                <input type="file" accept=".json" style={{display: 'none'}} onChange={handleFileUpload} />
                <span className={styles.fileInput}> <Folder /> Import JSON </span>
            </label>
            <div className={styles.cardsContainer}>
                {showWarning ? <div className={styles.warning}>
                    <div className={styles.warningHeader}>
                        <h2>Warning</h2>
                        <button onClick={()=>setShowWarning(false)}> <IconsLibrary.Close /> </button>
                    </div>
                    <p>Selecting items marked as Conflict will replace your existing local copies.</p>
                </div> : null}
                {importMeta ? <div className={styles.importMeta}>
                    <p><b>Created by</b> {importMeta.username}</p>
                    <p><b>Exported on</b> {getDateAndHour(importMeta.cretedAt)}</p>
                </div> : null}
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
                            <div className={styles.itemName}>
                                <p>{tag.name}</p>
                                {tag.status === 'conflict' ? <p className={styles.conflictMessage}>Conflict</p> : null}
                            </div>
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
            <button 
                className={styles.confirmButton} 
                onClick={handleImport}
                disabled={selectedLists.length === 0 && selectedTags.length === 0 && selectedNotes.length === 0}
            >Import</button>
        </div>
    )
}

export default Import;


const prepareImportData = async <T extends {_id?: string }> (
    incomingItems: T[], 
    table: any,
): Promise<(T & { status: 'new' | 'conflict'})[]> => {

    if (!incomingItems) return [];

    const existingIds = await table.toCollection().primaryKeys();
    const existingSet = new Set(existingIds);

    return incomingItems.map(item => {
        const isConflict = existingSet.has(item._id);
        return {
            ...item,
            status: isConflict ? 'conflict' : 'new',
        };
    });
};