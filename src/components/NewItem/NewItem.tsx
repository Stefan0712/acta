import { useRef, useState } from 'react';
import styles from './NewItem.module.css';
import { type Tag } from '../../types/models';
import {IconsLibrary} from '../../assets/icons.ts';
import { db } from '../../db';
import TagSelector from '../TagSelector/TagSelector.tsx';
import { ChevronDown, ChevronUp, Hand } from 'lucide-react';
import { offlineCreate } from '../../services/offlineManager.ts';

interface NewListItemProps {
    listId: string;
    online?: boolean;
}

type Priority = "low" | "normal" | "high";

const NewListItem: React.FC<NewListItemProps> = ({listId, online}) => {
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


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addNewItem();
        }
    };
    const handleChangePriority = () => {
        setPriority(prev => {
            const nextStep: Record<Priority, Priority> = {
                'low': 'normal',
                'normal': 'high',
                'high': 'low'
            };
            return nextStep[prev] || 'normal'; 
        });
    };


    const addNewItem = async () => {
        // Name validation
        if (!name || name.length === 0 || name.length > 100) {
            setError('Name is invalid. It should be between 1 and 100 characters.');
            return;
        }
        if (!userId) return;

        try {
            // Fetch Parent List to know its type
            const parentList = await db.lists.get(listId);
            if (!parentList) {
                setError("List not found!");
                return;
            }

            // Prepare data
            const newItemData: any = {
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
                createdAt: new Date(),
            };

            if (claimedBy) newItemData.claimedBy = claimedBy;
            
            if (dueDate) {
                const timeString = dueTime || "23:59";
                newItemData.deadline = new Date(`${dueDate}T${timeString}`).toISOString();
            }

            const isLocalList = !parentList.syncStatus; // If undefined, it's a device-only list

            if (isLocalList) {
                // Local only
                // Bypass the OfflineManager and write directly to Dexie
                // Generate the id manually here since offlineCreate isn't doing it
                await db.listItems.add({
                    ...newItemData,
                    _id: crypto.randomUUID(), // Native browser UUID
                    // No syncStatus means local
                });
            } else {
                // Synced / pending
                // Use offlineManager. It saves to Dexie and queues the job.
                // It automatically generates the UUID and sets syncStatus: 'pending'
                await offlineCreate(db.listItems, newItemData, 'CREATE_ITEM');
            }

            // Cleanup UI
            clearInputs();
            setShowMoreInputs(false);

        } catch (error) {
            console.error("Failed to add item:", error);
            setError("Could not add item.");
        }
    };
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
        <div className={`${styles.newItem} ${showMoreInputs ? styles.expanded : ''}`}>
            {showMoreInputs ? <div className={styles.header}>
                <h2>New Item</h2>
                <button onClick={()=>setShowMoreInputs(false)}>
                    <IconsLibrary.Close />
                </button>
            </div> : null}
            {showTagSelector ? <TagSelector 
                removeTag={(id)=>setTags(prev=>[...prev.filter(item=>item._id !== id)])}
                close={()=>setShowTagSelector(false)} 
                addTag={(newTag)=>setTags(prev=>[...prev, newTag])} 
                tags={tags}  
            /> : null}
            <div className={styles.basicInputs}>
                {showMoreInputs ? null : <button className={styles.expandButton} onClick={()=>setShowMoreInputs(prev=>!prev)}>
                    {showMoreInputs ? <ChevronDown /> : <ChevronUp />}
                </button>}
                <fieldset>
                    {showMoreInputs ? <label>Item Name</label> : null}
                    <input 
                        autoComplete="off" 
                        type="text" 
                        name="name"
                        onKeyDown={handleKeyDown}
                        onChange={(e)=>handleNameInput(e.target.value)} 
                        value={name} 
                        placeholder='New Item...' 
                        required 
                        minLength={0} 
                    />
                </fieldset>
               {showMoreInputs ?  <div className={styles.qty}>
                    <fieldset>
                        <label>Qty</label>
                        <input 
                            autoComplete="off" 
                            type="number" 
                            name="qty" 
                            onChange={(e)=>setQty(parseInt(e.target.value))} 
                            value={qty} 
                            placeholder='0' 
                            required
                            min={0} />
                    </fieldset>
                    <fieldset>
                        <label>Unit</label>
                        <input autoComplete="off" id={styles.unitInput} type="text" name="unit" onChange={(e)=>setUnit(e.target.value)} value={unit} placeholder='Unit' required minLength={0} />
                    </fieldset>
                </div> : null}
                {showMoreInputs ? null : <button className={styles.addButton} onClick={addNewItem}><IconsLibrary.Plus /></button>}
            </div>
            {error ? <p className='error-message'>{error}</p> : null}
            {showMoreInputs ? <div className={styles.moreInputs} ref={moreInputsRef}>
                <div className={styles.deadline}>
                    <fieldset>
                        <label>Due Date</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={styles.dateInput} min={new Date().toISOString().split("T")[0]}  />
                    </fieldset>
                    <fieldset>
                        <label>Due Hour</label>
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
                <fieldset>
                    <label>Description</label>
                    <input autoComplete="off" className={styles.descriptionInput} type="text" name="description" onChange={(e)=>setDescription(e.target.value)} value={description} placeholder='Description...' required minLength={0} />
                </fieldset>
                <div className={styles.bottomButtons} style={!online ? {gridTemplateColumns: '50px 50px 1fr'} : {}}>
                    {online ? <button 
                                onClick={handleClaimItem} 
                                className={styles.claimButton}
                                style={claimedBy ? {backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)'} : {}}
                            >
                            <Hand />
                            <p>{claimedBy ? 'Claimed' : 'Claim'}</p>
                            </button> 
                    : null}
                    <button className={styles.manageTagsButton} onClick={()=>setShowTagSelector(true)}>   
                        <IconsLibrary.Tag />
                        <p>Tags</p>
                    </button>
                    <button onClick={handleChangePriority} className={styles.priorityButton}>
                        {
                            priority === 'high' ? <IconsLibrary.High /> : 
                            priority === 'normal' ? <IconsLibrary.Normal /> :
                            priority === 'low' ? <IconsLibrary.Low /> :
                            <IconsLibrary.Normal />
                        }
                        <p>Priority</p>
                    </button>
                    <button onClick={addNewItem} className={styles.saveItemButton}>Add Item</button>
                </div>
            </div> : null}
        </div>
    );
}
 
export default NewListItem;
