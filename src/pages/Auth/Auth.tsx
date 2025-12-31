import { useState } from 'react';
import styles from './Auth.module.css';
import { IconsLibrary } from '../../assets/icons';
import { login, register, type AuthResponse } from '../../services/authService';
import { finalizeAuthentication } from '../../sync/authSync';
import { useNotifications } from '../../Notification/NotificationContext';
import { db } from '../../db';
import { MessageCircleWarning } from 'lucide-react';

const Auth = ({next}: {next?: ()=>void}) => {

    const [currentScreen, setCurrentScreen] = useState('login');

    const localUserToken = localStorage.getItem('jwt-token');

    if(localUserToken){
        next()
    } else {
        return (
            <div className={styles.auth}>
                <div className={styles.authContainer}>
                        {currentScreen === 'login' ? <Login next={next} toRegister={()=>setCurrentScreen('register')} toLocal={()=>setCurrentScreen("local")} /> 
                        : currentScreen === 'local' ? <Local next={next} /> 
                        : <Register next={next} toLocal={()=>setCurrentScreen("local")} toLogin={()=>setCurrentScreen('login')} />}
                </div>
            </div>
        )
    }
}

export default Auth;

const Local = ({next}: {next: ()=>void}) => {

    const {showNotification} = useNotifications();

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
            }
            await db.profile.add(newUser);
            localStorage.setItem('userId','local-user-id')
            localStorage.setItem('username', username);
            showNotification(`A local account with username ${username} was created!`, "success")
            next()
        } else {
            setUsernameError("Username is invalid. It should be between 1 and 16 characters!")
        }
    }

    return (
        <div className={styles.local}>
            <h1>Create a local account</h1>
            <div className={styles.warning}>
                <div className={styles.header}>
                    <h2>Warning</h2>
                    <MessageCircleWarning />
                </div>
                <h3>You can't access online features with a local account</h3>
            </div>

            <fieldset>
                <label>Username</label>
                <input value={username} onChange={(e)=>handleUsernameInput(e.target.value)} placeholder='Enter your username...' />
                {usernameError ? <p className='error-message'>{usernameError}</p> : null}
            </fieldset>

            <button className={styles.submitButton} onClick={handleSaveLocalAccount}>Create</button>
            <button className={styles.backButton}>
                <IconsLibrary.Arrow />
            </button>
        </div>
    )
}

interface LoginProps {
    toRegister: ()=>void;
    toLocal: ()=>void;
    next: ()=>void;
}
const Login: React.FC<LoginProps> = ({toRegister, toLocal, next}) => {

    const {showNotification} = useNotifications();

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
            showNotification("Logged in successfully", "success")
            next();
            
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
                <h3>Welcome back!</h3>
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
            <p className={styles.bottomLink}>Don't have an account? <b onClick={toRegister}>Create one here!</b> or create a <b onClick={toLocal}>Local Account</b></p>
            
        </div>
    )
}


interface RegisterProps {
    toLogin: ()=>void;
    toLocal: ()=>void;
    next: ()=>void;
}

const Register: React.FC<RegisterProps> = ({toLogin, toLocal, next}) => {

    const {showNotification} = useNotifications();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(localStorage.getItem('username') ?? '');
    const [validations, setValidations] = useState({length: false, upper: false, lower: false, number: false, symbol: false});
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [showUsernameError, setShowUsernameError] = useState(false);
    const [showPasswordError, setShowPassowrdError] = useState(false);
    const [showEmailError, setShowEmailError] = useState(false);

    const [apiError, setApiError] = useState('');


    const validatePassword = (password: string) => {
        // Minimum Length Check
        const minLength = 12;
        const isLongEnough = password.length >= minLength;
        // Check for Uppercase
        const hasUpper = /[A-Z]/.test(password); 
        // Check for Lowercase
        const hasLower = /[a-z]/.test(password);
        // Check for Number
        const hasNumber = /[0-9]/.test(password);
        // Check for Special Character
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        const errors = {
            length: isLongEnough,
            upper: hasUpper,
            lower: hasLower,
            number: hasNumber,
            symbol: hasSymbol
        };

        const isValid = Object.values(errors).every(Boolean);
        setIsPasswordValid(isValid);
        setValidations(errors);
    }

    const handlePasswordInput = (value: string) => {
        setPassword(value);
        validatePassword(value);
        if(showPasswordError){
            setShowPassowrdError(false);
        }
    }
    const handleUsernameInput = (value: string) => {
        setUsername(value);
        if(showUsernameError){
            setShowUsernameError(false);
        }

    }
    const handleEmailInput = (value: string) => {
        setEmail(value);
        if(showEmailError){
            setShowEmailError(false);
        }

    }
    const validateEmail = (email : string) => {
        if(!email) {
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.toLowerCase());
    };
    
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if(isPasswordValid && username.length > 3 && username.length < 20 && validateEmail(email)){
            const registrationData: {email: string, password: string, username: string} = {email, password, username};
            try {
                const authResponse = await register(registrationData);
                await finalizeAuthentication(authResponse); 
                showNotification("You registered successfully", "success")
                next();
                
            } catch (error) {
                showNotification("Failed to register", "error");
                const errorMessage = (error instanceof Error) 
                    ? error.message 
                    : 'An unknown registration error occurred.';
                setApiError(errorMessage);
            }
        }else{
            if(username.length <= 3 || username.length >= 20){
                setShowUsernameError(true);
            }
            if(!isPasswordValid){
                setShowPassowrdError(true);
            }
            if(!validateEmail(email)){
                setShowEmailError(true);
            }
        }
    }
    return (
        <div className={styles.register}>
            <form>
                <h2>Register</h2>
                <h3>Welcome!</h3>
                {apiError ? <p className={styles.apiError}>{apiError}</p> : null}
                <fieldset>
                    <label>Email</label>
                    <input type='email' value={email} name='email' onChange={(e)=>handleEmailInput(e.target.value)} required />
                    {showEmailError ? <p style={{color: 'red'}}>Email is invalid!</p> : null}
                </fieldset>
                <fieldset>
                    <label>Username</label>
                    <input type='string' value={username} name='username' onChange={(e)=>handleUsernameInput(e.target.value)} required minLength={3} maxLength={25}/>
                    {showUsernameError ? <p style={{color: 'red'}}>Username must be between 3 and 20 characters</p> : null}
                </fieldset>
                <fieldset>
                    <label>Password</label>
                    <input type='password' value={password} name='password' onChange={(e)=>handlePasswordInput(e.target.value)} required />
                    {showPasswordError ? <p style={{color: 'red'}}>Password is invalid!</p> : null}
                </fieldset>
                <button type='button' onClick={handleRegister}>Register</button>
                <div className={styles.validations}>
                    <b>The password must have</b>
                    <div className={`${styles.rule} ${validations.upper ? styles.active : ''}`}>
                        {validations.upper ? <IconsLibrary.Checkmark /> : <div className={styles.circle} />}
                        <p>One upper case character</p>
                    </div>
                    <div className={`${styles.rule} ${validations.lower ? styles.active : ''}`}>
                        {validations.lower ? <IconsLibrary.Checkmark /> : <div className={styles.circle} />}
                        <p>One lower case character</p>
                    </div>
                    <div className={`${styles.rule} ${validations.number ? styles.active : ''}`}>
                        {validations.number ? <IconsLibrary.Checkmark /> : <div className={styles.circle} />}
                        <p>At least one number</p>
                    </div>
                    <div className={`${styles.rule} ${validations.symbol ? styles.active : ''}`}>
                        {validations.symbol ? <IconsLibrary.Checkmark /> : <div className={styles.circle} />}
                        <p>At least one special character</p>
                    </div>
                    <div className={`${styles.rule} ${validations.length ? styles.active : ''}`}>
                        {validations.length ? <IconsLibrary.Checkmark /> : <div className={styles.circle} />}
                        <p>At least 12 characters</p>
                    </div>
                </div>
            </form>
            <p className={styles.bottomLink}>Have an account already? <b onClick={toLogin}>Log in here</b> or create <b onClick={toLocal}>Local Account</b></p>
        </div>
    )
}