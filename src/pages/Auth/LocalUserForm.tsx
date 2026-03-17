import { useState } from "react";
import { useNotifications } from "../../Notification/NotificationContext";
import { db } from "../../db";
import { useNavigate } from "react-router-dom";


const LocalUserForm = () => {

    const {showNotification} = useNotifications();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState<null | string>(null);

    const handleUsernameInput = (value: string) => {
        setUsernameError(null)
        setUsername(value);
    }

    const handleSaveLocalAccount = async () =>{
        if(username.length > 0 && username.length < 16){
            const newUser = {
                _id: "local-user-id",
                username,
                email: "",
                avatarUrl: "",
                createdAt: new Date().toISOString()
            }
            await db.profile.put(newUser);
            localStorage.setItem('userId','local-user-id')
            localStorage.setItem('username', username);
            showNotification(`A local account with username ${username} was created!`, "success");
            navigate('/')
        } else {
            setUsernameError("Username is invalid. It should be between 1 and 16 characters!")
        }
    }

    return (
        <div className='py-2 grid grid-cols-[1fr_auto] gap-2 items-center'>
            <div>
                <input value={username} onChange={(e)=>handleUsernameInput(e.target.value)} placeholder='Enter your username...' className="bg-zinc-950 p-2 rounded-lg w-full h-[40px]"/>
                {usernameError ? <p className='error-message'>{usernameError}</p> : null}
            </div>
            <button className='px-2 h-[36px] rounded bg-yellow-500 text-black' onClick={handleSaveLocalAccount}>Create</button>
        </div>
    )
}

export default LocalUserForm;