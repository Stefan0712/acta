import { useState } from 'react';
import styles from './EditItem.module.css';
import { type Store, type ShoppingListItem, type Category, type GroupMember } from '../../types/models';
import {IconsLibrary} from '../../assets/icons.ts';
import StoreSelector from '../StoreSelector/StoreSelector';
import CategorySelector from '../CategorySelector/CategorySelector';
import { db } from '../../db';
import UserSelector from '../UserSelector/UserSelector.tsx';
import { loadItem } from '../../helpers/deadlineFormatter.ts';
import { handleUpdateItem } from '../../services/itemService.ts';

interface NewShoppingListItemProps {
    itemData: ShoppingListItem;
    updateItem: (item: ShoppingListItem) => void;
    close: () => void;
    members?: GroupMember[];
    online: boolean;
}
// TODO: Add a fullscreen blur to block user from pressing other buttons while editing

const EditItem: React.FC<NewShoppingListItemProps> = ({itemData, updateItem, close, members, online}) => {

    const userId = localStorage.getItem('userId');
    const [name, setName] = useState(itemData.name ?? '');
    const [unit, setUnit] = useState(itemData.unit ?? '');
    const [qty, setQty] = useState(itemData.qty ?? 0);
    const [tags, setTags] = useState<string[]>(itemData.tags ?? []);
    const [description, setDescription] = useState(itemData.description ?? '');
    const [priority, setPriority] = useState<"low" | "normal" | "high">(itemData.priority ?? 'normal');
    const [assignedTo, setAssignedTo] = useState<string | null>(itemData.assignedTo ?? null);
    const [claimedBy, setClaimedBy] = useState<string | null>(itemData.claimedBy ?? null);
    const [dueDate, setDueDate] = useState(itemData.deadline ? loadItem(itemData.deadline).slice(0,10) : '');
    const [dueTime, setDueTime] = useState(itemData.deadline ? loadItem(itemData.deadline).slice(11,16) : '');
    const [store, setStore] = useState<Store | null>(itemData.store ?? null);
    const [category, setCategory] = useState<Category | null>(itemData.category ?? null);
    const [reminder, setReminder] = useState(itemData.reminder ?? 0);

    const [showNewTag, setShowNewTag] = useState(false);
    const [showUserSelector, setShowUserSelector] = useState(false);

    const [showStoreSelector, setShowStoreSelector] = useState(false);
    const [showCategorySelector, setShowCategorySelector] = useState(false);
    // TODO : Fix update function not updating the shopping list
    const addNewItem = async () =>{
        console.log(itemData)
        const currentDate = new Date();
        const updatedItem: any = {
            updatedAt: currentDate,
            name,
            unit,
            qty,
            description,
            tags,
            priority
        };
        if(store){
            updatedItem.store = store;
        }
        if(category){
            updatedItem.category = category;
        }
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
        if (online) {
            const onlineItem = await handleUpdateItem(itemData._id, updatedItem);
            updateItem(onlineItem);
        } else {
            await db.shoppingListItems.add(updatedItem);
            updateItem(updatedItem);
        }
        await db.shoppingListItems.update(itemData._id, updatedItem);
        updateItem({...itemData, ...updatedItem});
        close();

    }
    const addTag = (tag: string) => {
        if(tag){
            setTags(prev=>[...prev, tag]);
            setShowNewTag(false);
        }
    }
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
            {showStoreSelector ? <StoreSelector close={()=>setShowStoreSelector(false)} selectStore={(newStore)=>setStore(newStore)} currentStore={store} /> : null}
            {showCategorySelector ? <CategorySelector close={()=>setShowCategorySelector(false)} selectCategory={(newCategory)=>setCategory(newCategory)} currentCategory={category} /> : null}
            {members && showUserSelector ? <UserSelector users={members} close={()=>setShowUserSelector(false)} selectUser={(user)=>setAssignedTo(user)} selectedUser={assignedTo} /> : null}
            <div className={styles.header}>
                <h3>Edit Item</h3>
                <button onClick={close}><IconsLibrary.Close /></button>
            </div>
            <div className={styles.basicInputs}>
                <input type="text" name="name" onChange={(e)=>setName(e.target.value)} value={name} placeholder='Name...' required minLength={0} />
                <input id={styles.unitInput} type="text" name="unit" onChange={(e)=>setUnit(e.target.value)} value={unit} placeholder='Unit' required minLength={0} />
                <input type="number" name="qty" onChange={(e)=>setQty(parseInt(e.target.value))} value={qty} placeholder='0' required min={0} />
            </div>
            <div className={`${styles.moreInputs} ${styles.show}`}>
                <input className={styles.descriptionInput} type="text" name="description" onChange={(e)=>setDescription(e.target.value)} value={description} placeholder='Description...' required minLength={0} />
                {members ? <div className={styles.claimButtons}>
                    <button onClick={handleClaimItem} className={styles.userSelectorButton}>{claimedBy ? 'Claimed' : 'Claim item'}</button>
                    {claimedBy ? null : <button onClick={()=>setShowUserSelector(true)} className={styles.userSelectorButton}>{assignedTo ? 'Assigned to an user' : 'Assign item to user'}</button>}
                </div> : null}
                <div className={styles.priority}>
                    <p>Priority</p>
                    <div className={styles.priorityButtons}>
                        <button onClick={()=>setPriority('low')} className={`${styles.lowPriority} ${priority === 'low' ? styles.selectedPriority : ''}`}>Low</button>
                        <button onClick={()=>setPriority('normal')} className={`${styles.normalPriority} ${priority === 'normal' ? styles.selectedPriority : ''}`}>Normal</button>
                        <button onClick={()=>setPriority('high')} className={`${styles.highPriority} ${priority === 'high' ? styles.selectedPriority : ''}`}>High</button>
                    </div>
                </div>
                
                <div className={styles.deadline}>
                    <p>Deadline</p>
                    <div className={styles.deadlineInputs}>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={styles.dateInput} min={new Date().toISOString().split("T")[0]}  />
                        <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className={styles.timeInput} />
                    </div>
                </div>
                {dueDate && dueTime ? <div className={styles.priority}>
                    <p>Reminder</p>
                    <select value={reminder} onChange={(e) => setReminder(parseInt(e.target.value))}>
                        {REMINDER_OPTIONS.map((opt) => ( <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                        ))}
                    </select>
                </div> : null}
                <div className={styles.tagsContainer}>
                    <div className={styles.tagIcon}>
                        <IconsLibrary.Tag />
                    </div>
                    {tags?.length > 0 ? tags.map(tag=><p key={tag}>{tag}</p>) : <p>No tags</p>}
                    <button className={styles.iconButton} onClick={()=>setShowNewTag(prev=>!prev)}><IconsLibrary.Plus /></button>
                </div>
                {showNewTag ? <NewTag addTag={addTag}/> : null}
                <div className={styles.twoCols}>
                    <button style={store ? {borderColor: store.color} : {}} onClick={()=>setShowStoreSelector(true)}>{store ? store.name : 'Select Store'}</button>
                    <button style={category ? {borderColor: category.color} : {}} onClick={()=>setShowCategorySelector(true)}>{category ? category.name : 'Select Category'}</button>
                </div>
                <button className={styles.largeAddButton} onClick={addNewItem}><IconsLibrary.Save /> Save</button>
            </div>
        </div>
     );
}
 
export default EditItem;

interface NewTagProps {
    addTag: (tag: string) => void;
}
const NewTag: React.FC<NewTagProps> = ({addTag}) => {
    
    const [tag, setTag] = useState('')

    return (
        <div className={styles.tagInput}>
            <input type="text" name="tags" onChange={(e)=>setTag(e.target.value)} value={tag} placeholder='Tag' required minLength={0} />
            <button onClick={()=>addTag(tag)}><IconsLibrary.Plus /></button>
        </div>
    )
}


