import { useState } from 'react';
import styles from './EditItem.module.css';
import { type ShoppingListItem, type GroupMember, type Tag } from '../../types/models';
import {IconsLibrary} from '../../assets/icons.ts';
import { db } from '../../db';
import UserSelector from '../UserSelector/UserSelector.tsx';
import { loadItem } from '../../helpers/deadlineFormatter.ts';
import { handleUpdateItem } from '../../services/itemService.ts';
import TagSelector from '../TagSelector/TagSelector.tsx';

interface NewShoppingListItemProps {
    itemData: ShoppingListItem;
    updateItemLocally: (item: ShoppingListItem) => void;
    close: () => void;
    members?: GroupMember[];
    online: boolean;
}

type Priority = "low" | "normal" | "high";

const EditItem: React.FC<NewShoppingListItemProps> = ({itemData, updateItemLocally, close, members, online}) => {


    const userId = localStorage.getItem('userId');


    const [name, setName] = useState(itemData.name ?? '');
    const [unit, setUnit] = useState(itemData.unit ?? '');
    const [qty, setQty] = useState(itemData.qty ?? 0);
    const [tags, setTags] = useState<Tag[]>(itemData.tags ?? []);
    const [description, setDescription] = useState(itemData.description ?? '');
    const [priority, setPriority] = useState<Priority>(itemData.priority ?? 'normal');
    const [assignedTo, setAssignedTo] = useState<string | null>(itemData.assignedTo ?? null);
    const [claimedBy, setClaimedBy] = useState<string | null>(itemData.claimedBy ?? null);
    const [dueDate, setDueDate] = useState(itemData.deadline ? loadItem(itemData.deadline).slice(0,10) : '');
    const [dueTime, setDueTime] = useState(itemData.deadline ? loadItem(itemData.deadline).slice(11,16) : '');
    const [reminder, setReminder] = useState(itemData.reminder ?? 0);
    const [error, setError] = useState<null | string>(null);


    const [showUserSelector, setShowUserSelector] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);

    const updateItem = async () =>{
        const currentDate = new Date();
        const updatedItem: any = {
            _id: itemData._id,
            updatedAt: currentDate,
            name,
            unit,
            qty,
            description,
            tags,
            priority,
            reminder
        };
        if(assignedTo) {
            updatedItem.assignedTo = assignedTo;
        }
        if(claimedBy) {
            updatedItem.claimedBy = claimedBy;
        }
        if(dueDate) {
            const timeString = dueTime || "23:59";
            const localDateTime = new Date(`${dueDate}T${timeString}`);
            updatedItem.deadline = localDateTime.toISOString();
            if(updatedItem.deadline !== itemData.deadline) {
                itemData.isReminderSent = false;
            }
            updatedItem.reminder = reminder;
        }
        if (name && name.length > 0 && name.length < 21) {
            if (online) {
                const onlineItem = await handleUpdateItem(itemData._id, updatedItem);
                updateItemLocally(onlineItem);
            } else {
                await db.shoppingListItems.update(itemData._id, updatedItem);
                updateItemLocally(updatedItem);
            }
            close();
        } else {
            setError('Name is invalid. It should be between one and 20 characters.');
        }
    }
    const handleClaimItem = () => {
        setClaimedBy(prev => prev ? null : userId);
        setAssignedTo(null);
    }
    const handleNameInput = (value: string) => {
        setName(value)
        setError('');
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
            <div className={styles.header}>
                <h1>Edit Item</h1>
                <button onClick={close}>
                    <IconsLibrary.Close />
                </button>
            </div>
            {showTagSelector ? <TagSelector 
                removeTag={(id)=>setTags(prev=>[...prev.filter(item=>item._id !== id)])}
                close={()=>setShowTagSelector(false)} 
                addTag={(newTag)=>setTags(prev=>[...prev, newTag])} 
                tags={tags}  
            /> : null}
            {showUserSelector ? <UserSelector 
                users={members ?? []} 
                close={()=>setShowUserSelector(false)} 
                selectUser={(user)=>setAssignedTo(user)} 
                selectedUser={assignedTo} 
            /> : null}
            <fieldset className={styles.name}>
                <label>Item name</label>
                <input autoComplete="off" type="text" name="name" onChange={(e)=>handleNameInput(e.target.value)} value={name} placeholder='Name...' required minLength={0} />
            </fieldset>
            {error ? <p className='error-message'>{error}</p> : null}
            <fieldset className={styles.description}>
                <label>Description</label>
                <input autoComplete="off" className={styles.descriptionInput} type="text" name="description" onChange={(e)=>setDescription(e.target.value)} value={description} placeholder='Description...' required minLength={0} />
            </fieldset>
            <div className={`${styles.moreInputs} ${styles.show }`}>
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
                <button 
                    className={styles.manageTagsButton} 
                    onClick={()=>setShowTagSelector(true)}
                >   
                    <IconsLibrary.Tag />
                    <p>Manage tags ({tags.length})</p>
                    
                </button>
                <button className={styles.saveButton} onClick={updateItem}>Save Item</button>
            </div>
        </div>
     );
}
 
export default EditItem;
