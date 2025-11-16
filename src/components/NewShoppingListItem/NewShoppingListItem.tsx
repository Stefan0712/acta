import { useEffect, useRef, useState } from 'react';
import styles from './NewShoppingListItem.module.css';
import { type Store, type ShoppingListItem, type Category } from '../../types/models';
import { ObjectId } from 'bson';
import {IconsLibrary} from '../../assets/icons.ts';
import StoreSelector from '../StoreSelector/StoreSelector';
import CategorySelector from '../CategorySelector/CategorySelector';
import { db } from '../../db';

interface NewShoppingListItemProps {
    listId: string;
    addItemToList: (item: ShoppingListItem) => void;
    close: () => void;
}

const NewShoppingListItem: React.FC<NewShoppingListItemProps> = ({listId, addItemToList, close}) => {
    const userId = localStorage.getItem('userId')
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [qty, setQty] = useState(0);
    const [tags, setTags] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [priority, setPriority] = useState<"low" | "normal" | "high">('normal');
    const [assignedTo, setAssignedTo] = useState<string | null>(null);
    const [deadline, setDeadline] = useState<Date | null>(null);
    
    const moreInputsRef = useRef<HTMLDivElement>(null);


    const [store, setStore] = useState<Store | null>(null);
    const [category, setCategory] = useState<Category | null>(null);

    const [showMoreInputs, setShowMoreInputs] = useState(false);
    const [showNewTag, setShowNewTag] = useState(false);

    const [showStoreSelector, setShowStoreSelector] = useState(false);
    const [showCategorySelector, setShowCategorySelector] = useState(false);

    useEffect(() => {
        if (showMoreInputs && moreInputsRef?.current) {
            moreInputsRef.current.style.height = `${moreInputsRef.current.scrollHeight}px`;
        } else if(moreInputsRef?.current) {
            moreInputsRef.current.style.height = '30px';
        }
    }, [showMoreInputs]);


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
    }
    const addTag = (tag: string) => {
        if(tag){
            setTags(prev=>[...prev, tag]);
            setShowNewTag(false);
        }
    }
    return ( 
        <div className={styles.newItem}>
            {showStoreSelector ? <StoreSelector close={()=>setShowStoreSelector(false)} selectStore={(newStore)=>setStore(newStore)} currentStore={store} /> : null}
            {showCategorySelector ? <CategorySelector close={()=>setShowCategorySelector(false)} selectCategory={(newCategory)=>setCategory(newCategory)} currentCategory={category} /> : null}
            <div className={styles.header}>
                <h3>Add New Item</h3>
                <button onClick={close}><IconsLibrary.Close /></button>
            </div>
            <div className={styles.basicInputs}>
                <input type="text" name="name" onChange={(e)=>setName(e.target.value)} value={name} placeholder='Name...' required minLength={0} />
                <input id={styles.unitInput} type="text" name="unit" onChange={(e)=>setUnit(e.target.value)} value={unit} placeholder='Unit' required minLength={0} />
                <input type="text" name="qty" onChange={(e)=>setQty(parseInt(e.target.value))} value={qty} placeholder='0' required min={0} />
                <button className={styles.iconButton} onClick={addNewItem}><IconsLibrary.Plus /></button>
            </div>
            <div className={`${styles.moreInputs} ${showMoreInputs ? styles.show : ''}`} ref={moreInputsRef}>
                <button className={styles.showMoreButton} onClick={()=>setShowMoreInputs(prev=>!prev)}>{showMoreInputs ? "Show less" : "Show more"}</button>
                <input className={styles.descriptionInput} type="text" name="description" onChange={(e)=>setDescription(e.target.value)} value={description} placeholder='Description...' required minLength={0} />
                
                <div className={styles.priority}>
                    <p>Priority</p>
                    <div className={styles.priorityButtons}>
                        <button onClick={()=>setPriority('low')} className={`${styles.lowPriority} ${priority === 'low' ? styles.selectedPriority : ''}`}>Low</button>
                        <button onClick={()=>setPriority('normal')} className={`${styles.normalPriority} ${priority === 'normal' ? styles.selectedPriority : ''}`}>Normal</button>
                        <button onClick={()=>setPriority('high')} className={`${styles.highPriority} ${priority === 'high' ? styles.selectedPriority : ''}`}>High</button>
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
            <input type="text" name="tags" onChange={(e)=>setTag(e.target.value)} value={tag} placeholder='Tag' required minLength={0} />
            <button onClick={()=>addTag(tag)}><IconsLibrary.Plus /></button>
        </div>
    )
}