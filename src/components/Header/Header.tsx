import { Link, useNavigate } from 'react-router-dom';
import { IconsLibrary } from '../../assets/icons';


interface HeaderProps {
    prevUrl?: string;
    title: string;
    Button?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({prevUrl, title, Button}) => {

    const navigate = useNavigate();


    return (
        <div className='text-white w-full h-[50px] grid grid-cols-[50px_1fr_50px] gap-4 items-center justify-between'>
            {prevUrl ? <Link to={prevUrl} className='ml-2'><IconsLibrary.Arrow /></Link> : <button onClick={()=>navigate(-1)} className='ml-2'><IconsLibrary.Arrow /></button>}
            <h1 className='text-xl w-full h-full flex items-center justify-center'>{title}</h1>
            {Button ? <div className='w-full h-full flex items-center justify-center'>{Button}</div> : null}
        </div>
    )
}

export default Header;