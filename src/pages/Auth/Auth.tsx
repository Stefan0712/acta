import { useState } from 'react';
import Login from './Login';
import Register from './Register';



const Auth = () => {

    const [currentScreen, setCurrentScreen] = useState('login');

    return (
        <div className='h-full w-full flex flex-col items-center justify-center'>
            {currentScreen === 'login' ? <Login toRegister={()=>setCurrentScreen('register')} /> 
            : <Register toLogin={()=>setCurrentScreen('login')} />}
        </div>
    )
}

export default Auth;

