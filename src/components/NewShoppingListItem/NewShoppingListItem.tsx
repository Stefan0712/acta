import { useRef, useState } from 'react';
import styles from './NewShoppingListItem.module.css';
import { type Store, type ShoppingListItem, type Category, type GroupMember } from '../../types/models';
import { ObjectId } from 'bson';
import {IconsLibrary} from '../../assets/icons.ts';
import StoreSelector from '../StoreSelector/StoreSelector';
import CategorySelector from '../CategorySelector/CategorySelector';
import { db } from '../../db';
import UserSelector from '../UserSelector/UserSelector.tsx';

interface NewShoppingListItemProps {
    listId: string;
    addItemToList: (item: ShoppingListItem) => void;
    close: () => void;
    members?: GroupMember[];
    local?: boolean;
}

const NewShoppingListItem: React.FC<NewShoppingListItemProps> = ({listId, addItemToList, close, members, local}) => {
    const userId = localStorage.getItem('userId');


    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [qty, setQty] = useState(0);
    const [tags, setTags] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [priority, setPriority] = useState<"low" | "normal" | "high">('normal');
    const [assignedTo, setAssignedTo] = useState<string | null>(null);
    const [claimedBy, setClaimedBy] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    
    const moreInputsRef = useRef<HTMLDivElement>(null);


    const [store, setStore] = useState<Store | null>(null);
    const [category, setCategory] = useState<Category | null>(null);

    const [showMoreInputs, setShowMoreInputs] = useState(false);
    const [showNewTag, setShowNewTag] = useState(false);
    const [showUserSelector, setShowUserSelector] = useState(false);

    const [showStoreSelector, setShowStoreSelector] = useState(false);
    const [showCategorySelector, setShowCategorySelector] = useState(false);


    const addNewItem = async () =>{
        if(!userId) return;
        const currentDate = new Date();
        const newItem: ShoppingListItem = {
            _id: new ObjectId().toString(),
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
        };
        if(store){
            newItem.store = store;
        }
        if(category){
            newItem.category = category;
        }
        if(assignedTo) {
            newItem.assignedTo = assignedTo;
        }
        if(claimedBy) {
            newItem.claimedBy = claimedBy;
        }
        if(dueDate) {
            const timeString = dueTime || "23:59";
            const localDateTime = new Date(`${dueDate}T${timeString}`);
            newItem.deadline = localDateTime.toISOString();
        }
        await db.shoppingListItems.add(newItem);
        addItemToList(newItem);
        clearInputs();

    }
    const clearInputs = () => {
        setName('');
        setUnit('');
        setQty(0);
        setDescription('');
        setCategory(null);
        setStore(null);
        setIsPinned(false);
        setAssignedTo(null);
        setTags([]);
        setPriority('normal');
        setDueDate("");
        setDueTime("");
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
    return ( 
        <div className={styles.newItem}>
            {showStoreSelector ? <StoreSelector close={()=>setShowStoreSelector(false)} selectStore={(newStore)=>setStore(newStore)} currentStore={store} /> : null}
            {showCategorySelector ? <CategorySelector close={()=>setShowCategorySelector(false)} selectCategory={(newCategory)=>setCategory(newCategory)} currentCategory={category} /> : null}
            {showUserSelector ? <UserSelector users={members ?? []} close={()=>setShowUserSelector(false)} selectUser={(user)=>setAssignedTo(user)} selectedUser={assignedTo} /> : null}
            <div className={styles.header}>
                <h3>Add New Item</h3>
                <button onClick={close}><IconsLibrary.Close /></button>
            </div>
            <div className={styles.basicInputs} style={showMoreInputs ? {gridTemplateColumns: '2fr 1fr 1fr'} : {}}>
                <input autoComplete="off" type="text" name="name" onChange={(e)=>setName(e.target.value)} value={name} placeholder='Name...' required minLength={0} />
                <input autoComplete="off" id={styles.unitInput} type="text" name="unit" onChange={(e)=>setUnit(e.target.value)} value={unit} placeholder='Unit' required minLength={0} />
                <input autoComplete="off" type="number" name="qty" onChange={(e)=>setQty(parseInt(e.target.value))} value={qty} placeholder='0' required min={0} />
                <button className={styles.iconButton} onClick={addNewItem}><IconsLibrary.Plus /></button>
            </div>
            <div className={`${styles.moreInputs} ${showMoreInputs ? styles.show : ''}`} ref={moreInputsRef}>
                <button className={styles.showMoreButton} onClick={()=>setShowMoreInputs(prev=>!prev)}>{showMoreInputs ? "Show less" : "Show more"}</button>
                <input autoComplete="off" className={styles.descriptionInput} type="text" name="description" onChange={(e)=>setDescription(e.target.value)} value={description} placeholder='Description...' required minLength={0} />

                {!local ? <div className={styles.claimButtons}>
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
                {showMoreInputs ? <button className={styles.largeAddButton} onClick={addNewItem}><IconsLibrary.Plus /> Add Item</button> : null}
            </div>
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






