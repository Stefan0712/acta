import { useEffect, useState } from 'react';
import type { Category } from '../../types/models';
import styles from './CategorySelector.module.css';
import { ObjectId } from 'bson';
import { db } from '../../db';
import { IconsLibrary } from '../../assets/icons';
import { useNotifications } from '../../Notification/NotificationContext';

interface CategorySelectorProps {
    close: () => void;
    selectCategory: (category: Category | null) => void;
    currentCategory: Category | null;
}
const CategorySelector: React.FC<CategorySelectorProps> = ({close, selectCategory, currentCategory}) => {

    const {showNotification} = useNotifications();

    const [categories, setCategories] = useState<Category[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [saveCategory, setSaveCategory] = useState(false);

    useEffect(()=>{
        getCategories();
    },[]);

    const getCategories = async () =>{
        try{
            const response = await db.categories.toArray();
            if(response && response.length > 0){
                setCategories([...response]);
            }
        } catch (error) {
            console.error(error);
            showNotification("Failed to get categories", "error");
        }
    }
    const handleCreateCategory = (newCategory: Category) => {
        setCategories(prev=>[...prev, newCategory]);
        handleCategorySelect(newCategory); // Also select it immediately
    } 
    const handleCategorySelect = (category: Category | null) => {
        selectCategory(category);
        close();
    }
    
    const handleRemoveCategory = (categoryId: string) => {
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));
    }

    return ( 
        <div className={styles.categorySelector}>
            <h3>My Categories</h3>
            <NewCategory addCategory={handleCreateCategory} saveCategory={saveCategory} selectCategory={handleCategorySelect}/>
            <div className={styles.options}>
                <fieldset>
                    <input type='checkbox' onChange={(e)=>setSaveCategory(e.target.checked)} checked={saveCategory} />
                    <label>Save new category</label>
                </fieldset>
                <button onClick={()=>setEditMode(prev=>!prev)}>
                    {editMode ? <IconsLibrary.Save /> : <IconsLibrary.Edit />}
                    {editMode ? <p>Save</p> : <p>Edit</p>}
                </button>
            </div>
            <div className={styles.categoriesContainer}>
                {categories && categories.length > 0 ? categories.map((category) => (
                    <Category 
                        isSelected={currentCategory?._id === category._id} 
                        key={category._id} // Use the _id for the key
                        categoryData={category} 
                        selectCategory={handleCategorySelect} 
                        editMode={editMode} // Pass editMode down
                        removeCategoryFromList={handleRemoveCategory} // Pass the remover function down
                    />
                )) : <p>There are no categories saved</p>}
            </div>
            <button className={styles.closeButton} onClick={close}>Close</button>
        </div>
        );
}
 
export default CategorySelector;


interface CategoryProps {
    categoryData: Category;
    selectCategory: (categoryData: Category | null) => void;
    isSelected: boolean;
    editMode: boolean;
    removeCategoryFromList: (id: string) => void;
}

const Category = ({categoryData, selectCategory, isSelected, editMode, removeCategoryFromList} : CategoryProps) =>{

    const {showNotification} = useNotifications();

    const handleDelete = async () =>{
        try {
            await db.categories.delete(categoryData._id);
            removeCategoryFromList(categoryData._id); // Update parent state
            showNotification("Category deleted successfully!", "success");
            selectCategory(null); // Deselect if it was the current one
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete category!", "error");
        }
    }

    return (
        <div onClick={()=>!editMode ? selectCategory(categoryData) : null} className={`${styles.category} ${isSelected ? styles.selectedCategory : ''}`}>
            <div className={styles.categoryColor} style={{backgroundColor: categoryData.color}}></div>
            <h3>{categoryData.name}</h3>
            <button onClick={()=>editMode ? handleDelete() : null}>{editMode ? <IconsLibrary.Close /> : <IconsLibrary.Plus />}</button>
        </div>
    )
}


const NewCategory = ({addCategory, saveCategory, selectCategory}: {addCategory: (category: Category) => void, saveCategory: boolean, selectCategory: (category: Category) => void}) => {

    const [name, setName] = useState('');
    const [color, setColor] = useState('#1A1A1A');

    const {showNotification} = useNotifications();

    const handleSave = async () => {
        if(saveCategory){
            try {
                const newCategory = {
                    _id: new ObjectId().toString(),
                    name,
                    color
                }
                await db.categories.add(newCategory);
                addCategory(newCategory);
            } catch (error) {
                console.error(error);
                showNotification("Failed to create category", "error");
            }
        } else {
            const newCategory = {
                _id: new ObjectId().toString(),
                name,
                color
            };
            selectCategory(newCategory);
        }

    }
    return (
        <div className={styles.newCategory}>
            <input type='text' name='name' onChange={(e)=>setName(e.target.value)} value={name} minLength={0} placeholder='Category name' />
            <input type='color' name='color' onChange={(e)=>setColor(e.target.value)} value={color} />
            <button onClick={handleSave}><IconsLibrary.Plus /></button>
        </div>
    )
}