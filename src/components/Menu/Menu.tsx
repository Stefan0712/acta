import { Link } from 'react-router-dom';
import { IconsLibrary } from '../../assets/icons';
import { logout } from '../../services/authService';
import { useState } from 'react';
import { ChevronRight, CloudSync, Download, Info, List, Settings, Upload, User } from 'lucide-react';
import { useNotifications } from '../../Notification/NotificationContext';
import { db } from '../../db';


const Menu = () => {

    const {showNotification} = useNotifications();

    const isLoggedIn = localStorage.getItem('jwt-token');
    const [expandUserInfo, setExpandUserInfo] = useState(false);


    const handleLogout = () => {
        const isLoggedOut = logout();

        if (isLoggedOut) {
            showNotification("Logged out successfully",'success');
        } else {
            showNotification("Failed to log out",'error');
        }
    }


    const itemClass = "rounded-xl bg-zinc-900 w-full p-4 grid grid-cols-[50px_1fr_20px] items-center hover:bg-zinc-800 transition-colors active:scale-[0.98]";
    const iconBoxClass = "size-[40px] rounded-xl bg-zinc-700 flex items-center justify-center";
    return ( 
        <div className='w-full h-full flex flex-col gap-2 text-white px-4'>
            <div className='w-full py-3 flex items-center justify-center'>
                <h2 className='text-xl'>Menu</h2>
            </div>
            <div className='w-full border border-white/10 rounded-xl p-4 grid grid-cols-[50px_1fr_auto] gap-2 mb-4'>
                <div className='size-12 rounded-full bg-zinc-800 flex items-center justify-center'>
                    <User />
                </div>
                <div className='flex flex-col gap-1'>
                    <b onClick={()=>setExpandUserInfo(prev=>!prev)}>{isLoggedIn ? localStorage.getItem('username') : 'Local Account'}</b>
                    <Link to={'/auth'}>Login</Link>
                </div>
                {isLoggedIn ? <button onClick={handleLogout} className='flex gap-1 items-center'><IconsLibrary.Logout /> <p>Logout</p></button> : null}
            </div>
            {/* Export */}
            <Link to={'/export'} className={itemClass}>
                <div className={iconBoxClass}>
                    <Download className="size-5" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium">Export</p>
                    <p className='text-sm text-white/50'>Export your data to a JSON file</p>
                </div>
                <ChevronRight className="size-5 text-white/30" />
            </Link>

            {/* Import */}
            <Link to={'/import'} className={itemClass}>
                <div className={iconBoxClass}>
                    <Upload className="size-5" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium">Import</p>
                    <p className='text-sm text-white/50'>Import data from a JSON file</p>
                </div>
                <ChevronRight className="size-5 text-white/30" />
            </Link>

            {/* Sync */}
            <Link to={'/sync'} className={itemClass}>
                <div className={iconBoxClass}>
                    <CloudSync className="size-5" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium">Sync</p>
                    <p className='text-sm text-white/50'>Sync settings</p>
                </div>
                <ChevronRight className="size-5 text-white/30" />
            </Link>

            {/* Settings */}
            <Link to={'/'} className={itemClass}>
                <div className={iconBoxClass}>
                    <Settings className="size-5" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium">Settings</p>
                    <p className='text-sm text-white/50'>App settings</p>
                </div>
                <ChevronRight className="size-5 text-white/30" />
            </Link>

            {/* Changelogs */}
            <Link to={'/changelogs'} className={itemClass}>
                <div className={iconBoxClass}>
                    <List className="size-5" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium">Changelogs</p>
                    <p className='text-sm text-white/50'>Changelogs for latest updates</p>
                </div>
                <ChevronRight className="size-5 text-white/30" />
            </Link>

            {/* About */}
            <Link to={'/about'} className={itemClass}>
                <div className={iconBoxClass}>
                    <Info className="size-5" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium">About</p>
                    <p className='text-sm text-white/50'>About the app</p>
                </div>
                <ChevronRight className="size-5 text-white/30" />
            </Link>
            <p className='text-sm text-white/50 text-center mt-auto mb-4'>Latest updated on 17/03/2026 at 1:07 PM</p>
        </div>
     );
}
 
export default Menu;