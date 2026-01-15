import { useState } from 'react';
import styles from '../NewItem/NewItem.module.css';
import { type GroupMember, type ListItem, type Tag } from '../../types/models';
import {IconsLibrary} from '../../assets/icons.ts';
import { db } from '../../db';
import { loadItem } from '../../helpers/deadlineFormatter.ts';
import { handleUpdateItem } from '../../services/itemService.ts';
import TagSelector from '../TagSelector/TagSelector.tsx';
import { Hand } from 'lucide-react';

interface NewListItemProps {
    itemData: ListItem;
    close: () => void;
    online: boolean;
    members?: GroupMember[]
}

type Priority = "low" | "normal" | "high";

const EditItem: React.FC<NewListItemProps> = ({itemData, close, online}) => {


    const userId = localStorage.getItem('userId');


    const [name, setName] = useState(itemData.name ?? '');
    const [unit, setUnit] = useState(itemData.unit ?? '');
    const [qty, setQty] = useState(itemData.qty ?? 0);
    const [tags, setTags] = useState<Tag[]>(itemData.tags ?? []);
    const [description, setDescription] = useState(itemData.description ?? '');
    const [priority, setPriority] = useState<Priority>(itemData.priority ?? 'normal');
    const [claimedBy, setClaimedBy] = useState<string | null>(itemData.claimedBy ?? null);
    const [dueDate, setDueDate] = useState(itemData.deadline ? loadItem(itemData.deadline).slice(0,10) : '');
    const [dueTime, setDueTime] = useState(itemData.deadline ? loadItem(itemData.deadline).slice(11,16) : '');
    const [reminder, setReminder] = useState(itemData.reminder ?? 0);
    const [error, setError] = useState<null | string>(null);

    const showMoreInputs = true;


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
        if (name && name.length > 0 && name.length < 51) {
            if (online) {
                await handleUpdateItem(itemData._id, updatedItem);
            }
            await db.listItems.update(itemData._id, updatedItem);
            close();
        } else {
            setError('Name is invalid. It should be between one and 50 characters.');
        }
    }
    const handleClaimItem = () => {
        setClaimedBy(prev => prev ? null : userId);
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


    return ( 
        <div className={`${styles.editItem} ${showMoreInputs ? styles.expanded : ''}`}>
            {showMoreInputs ? <div className={styles.header}>
                <h2>Edit Item</h2>
                <button onClick={close}>
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
                <fieldset>
                    {showMoreInputs ? <label>Item Name</label> : null}
                    <input 
                        autoComplete="off" 
                        type="text" 
                        name="name"
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
            </div>
            {error ? <p className='error-message'>{error}</p> : null}
            {showMoreInputs ? <div className={styles.moreInputs}>
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
                    <button onClick={updateItem} className={styles.saveItemButton}>Update Item</button>
                </div>
            </div> : null}
        </div>
    );
}
 
export default EditItem;
