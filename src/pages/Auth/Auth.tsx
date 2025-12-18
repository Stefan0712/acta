import { useState } from 'react';
import styles from './Auth.module.css';
import { IconsLibrary } from '../../assets/icons';
import { login, register, type AuthResponse } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { finalizeAuthentication } from '../../sync/authSync';

const Auth = () => {

    const [currentScreen, setCurrentScreen] = useState('login');

    return (
        <div className={styles.auth}>
            <h1>Docket</h1>
            <div className={styles.authContainer}>
                    {currentScreen === 'login' ? <Login toRegister={()=>setCurrentScreen('register')} /> : <Register toLogin={()=>setCurrentScreen('login')} />}
            </div>
        </div>
    )
}

export default Auth;



const Login = ({toRegister} : {toRegister: ()=>void;}) => {


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
            window.location.reload();
            
        } catch (error) {
            setLoginError('Incorrect email or password. Please try again.'+error.message);
            console.error(error);
        }
    };

    return (
        <div className={styles.login}>
            <form>
                <h2>Login</h2>
                <h3>Welcome back!</h3>
                {loginError ? <p>{loginError}</p> : null}
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
                <p className={styles.bottomLink}>Don't have an account? <b onClick={toRegister}>Create one here!</b></p>
        </div>
    )
}
const Register = ({toLogin} : {toLogin: ()=>void;}) => {

    const navigate = useNavigate();

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
                navigate('/groups');
                
            } catch (error) {

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
            <p className={styles.bottomLink}>Have an account already? <b onClick={toLogin}>Log in here</b></p>
        </div>
    )
}