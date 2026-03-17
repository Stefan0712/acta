import { Link } from 'react-router-dom';
import { IconsLibrary } from '../../assets/icons';

const Navigation = () => {


    const btnClass = "w-full h-full flex flex-col gap-1 items-center justify-center";

    return ( 
        <div className='w-full h-[60px] grid grid-cols-4 text-white/60 bg-zinc-900'>
            <Link to={'/lists'} className={btnClass}>
                <IconsLibrary.Lists />
                <p className='text-sm'>Lists</p>
            </Link>
            <Link to={'/groups'} className={btnClass}>
                <IconsLibrary.Group />
                <p className='text-sm'>Groups</p>
            </Link>
            <Link to={'/notifications'} className={btnClass}>
                <IconsLibrary.Bell />
                <p className='text-sm'>Notifications</p>
            </Link>
            <Link to={'/menu'} className={btnClass}>
                <IconsLibrary.Menu />
                <p className='text-sm'>Menu</p>
            </Link>
        </div>
    );
}
 
export default Navigation;