import { useRef, useState } from 'react';
import styles from './NewItem.module.css';
import { type ListItem, type Tag } from '../../types/models';
import { ObjectId } from 'bson';
import {IconsLibrary} from '../../assets/icons.ts';
import { db } from '../../db';
import { createItem } from '../../services/itemService.ts';
import TagSelector from '../TagSelector/TagSelector.tsx';
import { Maximize } from 'lucide-react';

interface NewListItemProps {
    listId: string;
    addItemToList: (item: ListItem) => void;
    online?: boolean;
}

type Priority = "low" | "normal" | "high";

const NewListItem: React.FC<NewListItemProps> = ({listId, addItemToList, online}) => {
    const userId = localStorage.getItem('userId');

    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [qty, setQty] = useState(0);
    const [tags, setTags] = useState<Tag[]>([]);
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [priority, setPriority] = useState<Priority>('normal');
    const [claimedBy, setClaimedBy] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [reminder, setReminder] = useState(0);

    
    const moreInputsRef = useRef<HTMLDivElement>(null);



    const [showMoreInputs, setShowMoreInputs] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);

    const [error, setError] = useState('');

    const addNewItem = async () =>{
        if(!userId) return;
        const currentDate = new Date();
        const itemId = new ObjectId().toString();
        const newItem: ListItem = {
            _id: itemId,
            createdAt: currentDate,
            name,
            unit,
            qty,
            isChecked: false,
            listId,
            description,
            isPinned,
            isDeleted: false,
            tags,
            priority,
            authorId: userId,
            isReminderSent: false,
            reminder,
            isDirty: true,
            clientId: itemId
        };
        if(claimedBy) {
            newItem.claimedBy = claimedBy;
        }
        if(dueDate) {
            const timeString = dueTime || "23:59";
            const localDateTime = new Date(`${dueDate}T${timeString}`);
            newItem.deadline = localDateTime.toISOString();
        }
        if (name && name.length > 0 && name.length < 50) {
            if( online ) {
                const onlineItem = await createItem(newItem);
                addItemToList(onlineItem);
            } else {
                await db.listItems.add(newItem);
                addItemToList(newItem);
            }
            clearInputs();
            setShowMoreInputs(false);
        } else {
            setError('Name is invalid. It should be between one and 50 characters.');
        }

    }
    const clearInputs = () => {
        setName('');
        setUnit('');
        setQty(0);
        setDescription('');
        setIsPinned(false);
        setTags([]);
        setPriority('normal');
        setDueDate("");
        setError('')
        setDueTime("");
        setClaimedBy(null);
        setReminder(0);
    }
    const handleNameInput = (value: string) => {
        setName(value)
        setError('');
    }

    const handleClaimItem = () => {
        setClaimedBy(prev => prev ? null : userId);
    }
    const REMINDER_OPTIONS = [
        { value: 0, label: "No Reminder" },
        { value: 1, label: "1 Hour Before" },
        { value: 2, label: "2 Hours Before" },
        { value: 3, label: "3 Hours Before" },
        { value: 6, label: "6 Hours Before" },
        { value: 12, label: "12 Hours Before" },
        { value: 24, label: "1 Day Before" },
    ];
    return ( 
        <div className={styles.newItem}>
            {showTagSelector ? <TagSelector 
                removeTag={(id)=>setTags(prev=>[...prev.filter(item=>item._id !== id)])}
                close={()=>setShowTagSelector(false)} 
                addTag={(newTag)=>setTags(prev=>[...prev, newTag])} 
                tags={tags}  
            /> : null}
            <div className={styles.basicInputs}>
                <button className={styles.expandButton} onClick={()=>setShowMoreInputs(prev=>!prev)}>
                    {showMoreInputs ? <IconsLibrary.Close /> : <Maximize />}
                </button>
                <input autoComplete="off" type="text" name="name" onChange={(e)=>handleNameInput(e.target.value)} value={name} placeholder='Name...' required minLength={0} />
                <button className={styles.addButton} onClick={addNewItem}><IconsLibrary.Plus /></button>
            </div>
            
            {error ? <p className='error-message'>{error}</p> : null}
            {showMoreInputs ? <div className={`${styles.moreInputs} ${showMoreInputs ? styles.show : ''}`} ref={moreInputsRef}>
                <div className={styles.secondRow}>
                    <div className={styles.rowSection}>
                        <label>Qty</label>
                        <input autoComplete="off" type="number" name="qty" onChange={(e)=>setQty(parseInt(e.target.value))} value={qty} placeholder='0' required min={0} />
                    </div>
                    <div className={styles.rowSection}>
                        <label>Unit</label>
                        <input autoComplete="off" id={styles.unitInput} type="text" name="unit" onChange={(e)=>setUnit(e.target.value)} value={unit} placeholder='Unit' required minLength={0} />
                    </div>
                    <div className={styles.rowSection}>
                        <label>Priority</label>
                        <select onChange={(e)=>setPriority(e.target.value as Priority)} value={priority}>
                            <option value={'low'}>Low</option>
                            <option value={'normal'}>Normal</option>
                            <option value={'high'}>High</option>
                        </select>
                    </div>
                </div>
                <input autoComplete="off" className={styles.descriptionInput} type="text" name="description" onChange={(e)=>setDescription(e.target.value)} value={description} placeholder='Description...' required minLength={0} />
                <div className={styles.deadline}>
                    <fieldset>
                        <label>Due date</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={styles.dateInput} min={new Date().toISOString().split("T")[0]}  />
                    </fieldset>
                    <fieldset>
                        <label>Due hour</label>
                        <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className={styles.timeInput} />
                    </fieldset>
                    <fieldset>
                        <label>Reminder</label>
                        <select value={reminder} onChange={(e) => setReminder(parseInt(e.target.value))}>
                            {REMINDER_OPTIONS.map((opt) => ( <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                            ))}
                        </select>
                    </fieldset>
                </div>
                {online ? <div className={styles.claimButtons}>
                    <button 
                        onClick={handleClaimItem} 
                        className={styles.assignButton}
                        style={claimedBy ? {backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)'} : {}}
                    >
                        {claimedBy ? 'Claimed' : 'Claim item'}
                    </button>
                </div> : null}
                <button 
                    className={styles.manageTagsButton} 
                    onClick={()=>setShowTagSelector(true)}
                >   
                    <IconsLibrary.Tag />
                    <p>Manage tags ({tags.length})</p>
                    
                </button>
                <button onClick={addNewItem} className={styles.bigNewItemButton}>Add Item</button>
            </div> : null}
        </div>
     );
}
 
export default NewListItem;
