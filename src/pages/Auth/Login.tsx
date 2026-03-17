import { useState } from 'react';
import { useNotifications } from '../../Notification/NotificationContext';
import styles from './Auth.module.css';
import { login, type AuthResponse } from '../../services/authService';
import { finalizeAuthentication } from '../../sync/authSync';
import { useNavigate } from 'react-router-dom';


interface LoginProps {
    toRegister: ()=>void;
}
const Login: React.FC<LoginProps> = ({toRegister}) => {

    const {showNotification} = useNotifications();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const validateLoginInputs = () => {
        if (!email || !password) {
            setLoginError("Email and password are required.");
            return false;
        }
        return true;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (!validateLoginInputs()) {
            return;
        }
        const loginData: {email: string, password: string} = { email, password };

        try {
            const authResponse: AuthResponse = await login(loginData);
            await finalizeAuthentication(authResponse); 
            showNotification("Logged in successfully", "success");
            navigate('/groups');
        } catch (error) {
            setLoginError('Incorrect email or password. Please try again.');
            showNotification("Failed to login", "error")
            console.error(error);
        }
    };

    return (
        <div className='w-full h-full flex flex-col items-center justify-center p-2'>
            <form className='flex flex-col items-center justify-center text-white px-2'>
                <img src='/logo512.png' className='size-16 rounded-xl border border-white/10' />
                <h2 className='text-2xl font-bold'>Welcome Back</h2>
                <p className='text-sm text-white/60'>Sign in to your account to continue</p>
                {loginError ? <p className='error-message'>{loginError}</p> : null}
                <div className='w-full p-4 flex flex-col gap-2 rounded-xl border border-white/5 bg-[#121214] mt-2'>
                    <fieldset>
                        <label className='text-sm text-white/60'>Email</label>
                        <input 
                            type='email' 
                            value={email} 
                            name='email' 
                            onChange={(e)=>setEmail(e.target.value)} 
                            required
                            className='bg-zinc-950 text-white/50'
                            />
                    </fieldset>
                    <fieldset>
                        <label className='text-sm text-white/60'>Password</label>
                        <input 
                            type='password' 
                            value={password} 
                            name='password' 
                            onChange={(e)=>setPassword(e.target.value)} 
                            required 
                            className='bg-zinc-950 text-white/50'
                        />
                    </fieldset>
                    <p className={`${styles.forgotPasswordLink} text-sm`}>Forgot Password?</p>
                    <button type='button' onClick={handleLogin}>Sign in</button>
                </div>
            </form>
            <p className='text-sm text-white/60 mt-4'>Don't have an account? <b onClick={toRegister}>Create one</b></p>
            
        </div>
    )
}

export default Login;