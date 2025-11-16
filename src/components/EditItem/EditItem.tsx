import { useEffect, useRef, useState } from 'react';
import styles from './NewShoppingListItem.module.css';
import { type Store, type ShoppingListItem, type Category } from '../../types/models';
import {IconsLibrary} from '../../assets/icons.ts';
import StoreSelector from '../StoreSelector/StoreSelector';
import CategorySelector from '../CategorySelector/CategorySelector';
import { db } from '../../db';

interface NewShoppingListItemProps {
    itemData: ShoppingListItem;
    updateItem: (item: ShoppingListItem) => void;
    close: () => void;
}

const NewShoppingListItem: React.FC<NewShoppingListItemProps> = ({itemData, updateItem, close}) => {
    const [name, setName] = useState(itemData.name ?? '');
    const [unit, setUnit] = useState(itemData.unit ?? '');
    const [qty, setQty] = useState(itemData.qty ?? 0);
    const [tags, setTags] = useState<string[]>(itemData.tags ?? []);
    const [description, setDescription] = useState(itemData.description ?? '');
    const [priority, setPriority] = useState<"low" | "normal" | "high">(itemData.priority ?? 'normal');
    
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
        await db.shoppingListItems.update(itemData._id, updatedItem);
        updateItem(updatedItem);
        close();

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
                <h3>Edit Item</h3>
                <button onClick={close}><IconsLibrary.Close /></button>
            </div>
            <div className={styles.basicInputs}>
                <input type="text" name="name" onChange={(e)=>setName(e.target.value)} value={name} placeholder='Name...' required minLength={0} />
                <input id={styles.unitInput} type="text" name="unit" onChange={(e)=>setUnit(e.target.value)} value={unit} placeholder='Unit' required minLength={0} />
                <input type="text" name="qty" onChange={(e)=>setQty(parseInt(e.target.value))} value={qty} placeholder='0' required min={0} />
                <button className={styles.iconButton} onClick={addNewItem}><IconsLibrary.Save /></button>
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