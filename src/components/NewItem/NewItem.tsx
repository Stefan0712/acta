import { useRef, useState } from 'react';
import styles from './NewItem.module.css';
import { type ShoppingListItem, type GroupMember } from '../../types/models';
import { ObjectId } from 'bson';
import {IconsLibrary} from '../../assets/icons.ts';
import { db } from '../../db';
import UserSelector from '../UserSelector/UserSelector.tsx';
import { NotificationService } from '../../helpers/NotificationService.ts';
import { createItem } from '../../services/itemService.ts';

interface NewShoppingListItemProps {
    listId: string;
    addItemToList: (item: ShoppingListItem) => void;
    members?: GroupMember[];
    online?: boolean;
}

type Priority = "low" | "normal" | "high";

const NewShoppingListItem: React.FC<NewShoppingListItemProps> = ({listId, addItemToList, members, online}) => {
    const userId = localStorage.getItem('userId');

    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [qty, setQty] = useState(0);
    const [tags, setTags] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [priority, setPriority] = useState<Priority>('normal');
    const [assignedTo, setAssignedTo] = useState<string | null>(null);
    const [claimedBy, setClaimedBy] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [reminder, setReminder] = useState(0);
    
    const moreInputsRef = useRef<HTMLDivElement>(null);



    const [showMoreInputs, setShowMoreInputs] = useState(false);
    const [showNewTag, setShowNewTag] = useState(false);
    const [showUserSelector, setShowUserSelector] = useState(false);

    const [error, setError] = useState('');



    const addNewItem = async () =>{
        if(!userId) return;
        const currentDate = new Date();
        const itemId = new ObjectId().toString();
        const newItem: ShoppingListItem = {
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
        if(assignedTo) {
            newItem.assignedTo = assignedTo;
            NotificationService.send({recipientId: assignedTo, category: "ASSIGNMENT", message: `${name} was assigned to you`, metadata: {listId, itemId}});
        }
        if(claimedBy) {
            newItem.claimedBy = claimedBy;
            NotificationService.send({recipientId: userId, category: "ASSIGNMENT", message: `${name} was assigned to you`, metadata: {listId, itemId}});
        }
        if(dueDate) {
            const timeString = dueTime || "23:59";
            const localDateTime = new Date(`${dueDate}T${timeString}`);
            newItem.deadline = localDateTime.toISOString();
        }
        if (name && name.length > 0 && name.length < 21) {
            if( online ) {
                const onlineItem = await createItem(newItem);
                addItemToList(onlineItem);
            } else {
                await db.shoppingListItems.add(newItem);
                addItemToList(newItem);
            }
            clearInputs();
        } else {
            setError('Name is invalid. It should be between one and 20 characters.');
        }

    }
    const clearInputs = () => {
        setName('');
        setUnit('');
        setQty(0);
        setDescription('');
        setIsPinned(false);
        setAssignedTo(null);
        setTags([]);
        setPriority('normal');
        setDueDate("");
        setError('')
        setDueTime("");
    }
    const handleNameInput = (value: string) => {
        setName(value)
        setError('');
    }
    const addTag = (tag: string) => {
        if(tag){
            setTags(prev=>[...prev, tag]);
            setShowNewTag(false);
        }
    };

    const handleClaimItem = () => {
        setClaimedBy(prev => prev ? null : userId);
        setAssignedTo(null);
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
            {showUserSelector ? <UserSelector users={members ?? []} close={()=>setShowUserSelector(false)} selectUser={(user)=>setAssignedTo(user)} selectedUser={assignedTo} /> : null}
            <div className={styles.basicInputs}>
                <button className={styles.expandButton} onClick={()=>setShowMoreInputs(prev=>!prev)}>
                    <IconsLibrary.Arrow style={showMoreInputs ? {transform: 'rotateZ(90deg)'} : {transform: 'rotateZ(-90deg)'}} />
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
                {online ? <div className={styles.claimButtons}>
                    <button onClick={handleClaimItem} className={styles.userSelectorButton}>{claimedBy ? 'Claimed' : 'Claim item'}</button>
                    {claimedBy ? null : <button onClick={()=>setShowUserSelector(true)} className={styles.userSelectorButton}>{assignedTo ? 'Assigned to an user' : 'Assign item to user'}</button>}
                </div> : null}
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
                <div className={styles.tagsContainer}>
                    <div className={styles.tagIcon}>
                        <IconsLibrary.Tag />
                    </div>
                    {tags?.length > 0 ? tags.map(tag=><p key={tag}>{tag}</p>) : <p>No tags</p>}
                    <button className={styles.iconButton} onClick={()=>setShowNewTag(prev=>!prev)}><IconsLibrary.Plus /></button>
                </div>
                {showNewTag ? <NewTag addTag={addTag}/> : null}
            </div> : null}
        </div>
     );
}
 
export default NewShoppingListItem;

interface NewTagProps {
    addTag: (tag: string) => void;
}
const NewTag: React.FC<NewTagProps> = ({addTag}) => {
    
    const [tag, setTag] = useState('')

    return (
        <div className={styles.tagInput}>
            <input autoComplete="off" type="text" name="tags" onChange={(e)=>setTag(e.target.value)} value={tag} placeholder='Tag' required minLength={0} />
            <button onClick={()=>addTag(tag)}><IconsLibrary.Plus /></button>
        </div>
    )
}






