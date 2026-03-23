import { useState } from 'react';
import Login from './Login';
import Register from './Register';



const Auth = ({onLoginSuccess}: {onLoginSuccess: ()=>void}) => {

    const [currentScreen, setCurrentScreen] = useState('login');

    return (
        <div className='h-full w-full flex flex-col items-center justify-center'>
            {currentScreen === 'login' ? <Login onLoginSuccess={onLoginSuccess} toRegister={()=>setCurrentScreen('register')} /> 
            : <Register onLoginSuccess={onLoginSuccess} toLogin={()=>setCurrentScreen('login')} />}
        </div>
    )
}

export default Auth;

