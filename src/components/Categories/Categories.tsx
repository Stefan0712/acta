import styles from './Categories.module.css';

interface CategoriesProps {
    category: string;
    setCategory: (newCat: string)=>void;
    categories: string[];
}

const Categories: React.FC<CategoriesProps> = ({category, setCategory, categories}) =>{

    return (
        <div className={styles.categories}>
            {categories?.map(cat=> <button key={cat} onClick={()=>setCategory(cat)} className={category === cat ? styles.selectedCategory : ''}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>)}
        </div>
    )
}

export default Categories;