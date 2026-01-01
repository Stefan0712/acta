import { useState } from 'react';
import { useNotifications } from '../../Notification/NotificationContext';
import styles from './Auth.module.css';
import { login, type AuthResponse } from '../../services/authService';
import { finalizeAuthentication } from '../../sync/authSync';
import { useNavigate } from 'react-router-dom';


interface LoginProps {
    toRegister: ()=>void;
    next?: ()=>void;
    onLoginSuccess?: ()=>void;
}
const Login: React.FC<LoginProps> = ({toRegister, onLoginSuccess, next}) => {

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
            if(next && onLoginSuccess){
                onLoginSuccess();
                next();
            } else {
                navigate('/groups')
            }
            
        } catch (error) {
            setLoginError('Incorrect email or password. Please try again.');
            showNotification("Failed to login", "error")
            console.error(error);
        }
    };

    return (
        <div className={styles.login}>
            <form>
                <h2>Login</h2>
                {loginError ? <p className='error-message'>{loginError}</p> : null}
                <fieldset>
                    <label>Email</label>
                    <input type='email' value={email} name='email' onChange={(e)=>setEmail(e.target.value)} required />
                </fieldset>
                <fieldset>
                    <label>Password</label>
                    <input type='password' value={password} name='password' onChange={(e)=>setPassword(e.target.value)} required />
                </fieldset>
                <p className={styles.forgotPasswordLink}>Forgot Password?</p>
                <button type='button' onClick={handleLogin}>Sign in</button>
            </form>
            <p className={styles.bottomLink}>Don't have an account? <b onClick={toRegister}>Create one</b></p>
            
        </div>
    )
}

export default Login;