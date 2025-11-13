import { useEffect, useState } from 'react';
import type { Store } from '../../types/models';
import styles from './StoreSelector.module.css';
import { ObjectId } from 'bson';
import { db } from '../../db';
import { IconsLibrary } from '../../assets/icons';
import { useNotifications } from '../../Notification/NotificationContext';

interface StoreSelectorProps {
    close: () => void;
    selectStore: (store: Store | null) => void;
    currentStore: Store | null;
}
const StoreSelector: React.FC<StoreSelectorProps> = ({close, selectStore, currentStore}) => {

    const {showNotification} = useNotifications();

    const [stores, setStores] = useState<Store[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [saveStore, setSaveStore] = useState(false);

    useEffect(()=>{
        getStores();
    },[]);

    const getStores = async () =>{
        try{
            const response = await db.stores.toArray();
            if(response && response.length > 0){
                setStores([...response]);
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get stores", "error");
        }
    }
    const handleCreateStore = (newStore: Store) => {
        setStores(prev=>[...prev, newStore]);
        handleStoreSelect(newStore);
    } 
    const handleStoreSelect = (store: Store | null) => {
        selectStore(store);
        if(!editMode){
            close();
        }
    }
    const handleDelete = async (storeId: string) =>{
        try {
            await db.stores.delete(storeId);
            showNotification("Store deleted successfully!", "success");
            selectStore(null);
            setStores(prev=>[...prev.filter(item=>item._id!==storeId)]);
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete store!", "error");
        }
    }
    return ( 
        <div className={styles.storeSelector}>
            <h3>My Stores</h3>
            <NewStore addStore={handleCreateStore} saveStore={saveStore} selectStore={handleStoreSelect}/>
            <div className={styles.options}>
                <fieldset>
                    <input type='checkbox' onChange={(e)=>setSaveStore(e.target.checked)} checked={saveStore} />
                    <label>Save new store</label>
                </fieldset>
                <button onClick={()=>setEditMode(prev=>!prev)}>
                    {editMode ? <IconsLibrary.Save /> : <IconsLibrary.Edit />}
                    {editMode ? <p>Save</p> : <p>Edit</p>}
                </button>
            </div>
            <div className={styles.storesContainer}>
                {stores && stores.length > 0 ? stores.map((store, index)=><Store handleDelete={handleDelete} editMode={editMode} isSelected={currentStore?._id === store._id} key={index} storeData={store} selectStore={handleStoreSelect} />) : <p>There are no stores saved</p>}
            </div>
            <button className={styles.closeButton} onClick={close}>Close</button>
        </div>
     );
}
 
export default StoreSelector;

const Store = ({storeData, selectStore, isSelected, editMode, handleDelete} : {handleDelete: (storeId: string) => void, storeData: Store, selectStore: (storeData: Store | null)=>void, isSelected: boolean, editMode: boolean}) =>{

    
    return (
        <div onClick={()=>!editMode ? selectStore(storeData) : null} className={`${styles.store} ${isSelected ? styles.selectedStore : ''}`}>
            <div className={styles.storeColor} style={{backgroundColor: storeData.color}}></div>
            <h3>{storeData.name}</h3>
            <button onClick={()=>editMode ? handleDelete(storeData._id) : null}>{editMode ? <IconsLibrary.Close /> : <IconsLibrary.Plus />}</button>
        </div>
    )
}

const NewStore = ({addStore, saveStore, selectStore}: {addStore: (store: Store) => void, saveStore: boolean, selectStore: (store: Store)=>void}) => {

    const [name, setName] = useState('');
    const [color, setColor] = useState('#1A1A1A');

    const {showNotification} = useNotifications();

    const handleSave = async () => {
        if(saveStore){
            try {
                const newStore = {
                    _id: new ObjectId().toString(),
                    name,
                    color
                }
                await db.stores.add(newStore);
                addStore(newStore);
            } catch (error) {
                console.error(error);
                showNotification("Failed to create store", "error");
            }
        }else{
            const newStore = {
                _id: new ObjectId().toString(),
                name,
                color
            }
            selectStore(newStore);
        }
        

    }
    return (
        <div className={styles.newStore}>
            <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} minLength={0} placeholder='Store name' />
            <input type='color' name='color' onChange={(e)=>setColor(e.target.value)} value={color} />
            <button onClick={handleSave}><IconsLibrary.Plus /></button>
        </div>
    )
}