import { useEffect, useMemo, useState } from 'react';
import styles from './LocalList.module.css';
import { type ListItem as ItemType, type List as IList } from '../../types/models.ts';
import { db } from '../../db.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../Notification/NotificationContext.tsx';
import {IconsLibrary} from '../../assets/icons.ts';
import NewListItem from '../../components/NewItem/NewItem.js';
import { getDateAndHour } from '../../helpers/dateFormat.ts';
import EditList from '../../components/EditList/EditList.tsx';
import ListItem from '../../components/ListItem/ListItem.tsx';
import Loading from '../../components/LoadingSpinner/Loading.tsx';
import Categories from '../../components/Categories/Categories.tsx';
import Header from '../../components/Header/Header.tsx';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal.tsx';



const List = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();

    const [showPageMenu, setShowPageMenu] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [listData, setListData] = useState<IList | null>(null);
    const [listItems, setListItems] = useState<ItemType[]>([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Filter items based on the current category
    const filteredItems = useMemo(() => {
        if(selectedCategory === 'all'){
            return listItems.filter(item=>!item.isDeleted);
        }else if(selectedCategory === 'pinned') {
            return listItems.filter(item=>item.isPinned && !item.isDeleted);
        }else if(selectedCategory === 'deleted') {
            return listItems.filter(item=>item.isDeleted);
        }
        return [];
    }, [listItems, selectedCategory]);

    // Filter filtered items into completed and uncompleted
    const uncompletedItems = useMemo(()=> {
        return filteredItems.filter(item => !item.isChecked);
    },[filteredItems]);

    const completedItems = useMemo(()=> {
        return filteredItems.filter(item => item.isChecked);
    },[filteredItems]);

    useEffect(()=>{
        if (!id){
            showNotification("No id found in the url", "error");
            return;
        }
        const fetchPageData = async () => {
            try {
                const listDataPromise = db.lists.get(id);
                const listItemsPromise = db.listItems.where('listId').equals(id).toArray();

                const [listDataResponse, listItemsResponse] = await Promise.all([
                    listDataPromise,
                    listItemsPromise
                ]);
                if (listDataResponse) {
                    setListData(listDataResponse);
                    setListItems(listItemsResponse);
                } else {
                    showNotification('No list data found', "error");
                }
            } catch (error) {
                console.error("Failed to fetch page data:" , error);
                showNotification("Error loading list", "error")
            }
        };
        fetchPageData();
    },[id, showNotification]);

    const deleteList = async () =>{
        try {
            await db.lists.update(listData?._id, {isDeleted: true});
            showNotification("List deleted", "success");
            navigate('/lists');
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete list.", "error");
        }
    }
    const restoreList = async () =>{
        try {
            await db.lists.update(listData?._id, {isDeleted: false});
            showNotification("List restored", "success");
            navigate('/');
        } catch (error) {
            console.error(error);
            showNotification("Failed to restore list.", "error");
        }
    }
    // Optimistically update item list
    const updateItem = (updatedItem: ItemType) => {
        const updatedList = listItems.map(item=>item._id===updatedItem._id ? updatedItem : item);
        setListItems(updatedList);
    };

    if(!listData) {
        return (
           <Loading />
        )
    } else if(listData && listData._id) {
        return ( 
            <div className={styles.List}>
                {showPageMenu ? <PageMenu close={()=>setShowPageMenu(false)} edit={()=>setShowEdit(true)} handleDelete={()=>setShowDeleteModal(true)} isDeleted={listData.isDeleted} handleRestore={restoreList}/> : null}
                {showEdit ? <EditList close={()=>setShowEdit(false)} listData={listData} updateData={(newData)=>setListData(newData)} /> : null}
                {showDeleteModal ? <ConfirmationModal cancel={()=>setShowDeleteModal(false)}  confirm={deleteList} title='Delete this list?' content='Are you sure you want to delete this list? You can restore it later' /> : null}
                <Header 
                    prevUrl={'/lists'} 
                    title={listData.name} 
                    Button={<button onClick={()=>setShowPageMenu(prev=>!prev)}><IconsLibrary.Dots /></button>}
                />
                <div className={styles.listMeta}>
                    <p className={styles.createdAt}>Created on {getDateAndHour(listData.createdAt)}</p>
                    {listData.updatedAt ? <p className={styles.updatedAt}>Latest update on {getDateAndHour(listData.updatedAt)}</p> : null}
                    <p>{listData.description}</p>
                    <Summaries 
                        totalItems={listItems && listItems.length >= 0 ? listItems.filter(item=>!item.isDeleted).length : 0} 
                        completedItems={listItems && listItems.length >= 0 ? listItems.filter(item=>item.isChecked && !item.isDeleted).length : 0}
                    />
                </div>
                <Categories category={selectedCategory} setCategory={(newCat)=>setSelectedCategory(newCat)} categories={['all','pinned','deleted']} />
                <div className={styles.listItemsContainer}>
                    {filteredItems && filteredItems.length > 0 ? 
                        <>
                            {uncompletedItems.map(item=><ListItem online={false} updateItemLocally={updateItem} key={item._id} data={item} />)}
                            {completedItems.length > 0 ? <h3 className={styles.sectionTitle}>Completed</h3> : null}
                            {completedItems.map(item=><ListItem online={false} updateItemLocally={updateItem} key={item._id} data={item} />)}
                        </>  : 
                            <p className='no-items-text'>No items yet</p>
                    }
                </div>
                <NewListItem listId={listData._id} addItemToList={(newItem)=>setListItems(prev=>[...prev, newItem])} />
            </div>
        );
    }
    
}
 
export default List;

interface SummariesProps {
    totalItems: number;
    completedItems: number;
}
const Summaries: React.FC<SummariesProps> = ({totalItems, completedItems}) => {

    const percentage = (completedItems/totalItems)*100;
    return (
        <div className={styles.summaries}>
            <div className={styles.collumns}>
                <div className={styles.collumn}>
                    <b>{totalItems ?? 0}</b>
                    <p>TOTAL</p>
                </div>
                <div className={styles.collumn}>
                    <b>{(totalItems || 0) - (completedItems || 0)}</b>
                    <p>ACTIVE</p>
                </div>
                <div className={styles.collumn}>
                    <b>{completedItems || 0}</b>
                    <p>COMPLETED</p>
                </div>
            </div>
            <div className={styles.progress}>
                <div className={styles.progressText}>
                    <p>TOTAL PROGRESS</p>
                    <b>{percentage || 0}%</b>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressLine} style={{width: `${percentage}%`}} />
                </div>
            </div>
        </div>
    )
}


interface PageMenuProps {
    close: () => void;
    edit: () => void;
    handleDelete: () => void;
    handleRestore: () => void;
    isDeleted: boolean;
}

const PageMenu: React.FC<PageMenuProps> = ({close, edit, handleDelete, isDeleted, handleRestore}) => {

    const showEditModal = () => {
        edit();
        close();
    }
    return (
        <div className={styles.pageMenu}>
            <button onClick={showEditModal}>Edit List</button>
            {isDeleted ? <button style={{color: 'var(--text-color)'}} onClick={handleRestore}>Restore List</button> : <button onClick={handleDelete}>Delete List</button>}
            <button onClick={close}>Cancel</button>
        </div>
    )
}
