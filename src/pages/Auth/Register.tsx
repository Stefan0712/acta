import { useState } from 'react';
import { useNotifications } from '../../Notification/NotificationContext';
import { IconsLibrary } from '../../assets/icons';
import { finalizeAuthentication } from '../../sync/authSync';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { LockIcon, Mail, User } from 'lucide-react';


interface RegisterProps {
    toLogin: ()=>void;
}

const Register: React.FC<RegisterProps> = ({toLogin}) => {

    const {showNotification} = useNotifications();
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
        const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

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
                showNotification("You registered successfully", "success");
                navigate('/groups') 
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
        <div className='w-full h-full flex flex-col items-center justify-center p-2'>
            <form className='flex flex-col items-center justify-center text-white px-2 mt-auto'>
                <img src='/logo512.png' className='size-16 rounded-xl border border-white/10' />
                <h2 className='text-2xl font-bold'>Create account</h2>
                <p className='text-sm text-white/60'>Create your account to access online features</p>
                {apiError ? <p >{apiError}</p> : null}
                <div className='w-full p-4 flex flex-col gap-2 rounded-xl border border-white/5 bg-[#121214] mt-2'>
                    <fieldset>
                        <label className='text-sm text-white/60'>Username</label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
                                <User className="size-5 text-gray-400"/>
                            </div>
                            <input 
                                type='string' 
                                value={username} 
                                name='username' 
                                onChange={(e)=>handleUsernameInput(e.target.value)} 
                                required 
                                minLength={3} 
                                maxLength={25}
                                className='bg-zinc-950 text-white/50 pl-10 w-full'
                                style={{paddingLeft: '40px'}}
                            />
                        </div>
                        {showUsernameError ? <p style={{color: 'red'}}>Username must be between 3 and 20 characters</p> : null}
                    </fieldset>
                    <fieldset>
                        <label className='text-sm text-white/60'>Email</label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
                                <Mail className="size-5 text-gray-400"/>
                            </div>
                            <input 
                                type='email' 
                                value={email} 
                                name='email' 
                                onChange={(e)=>handleEmailInput(e.target.value)} 
                                required 
                                className='bg-zinc-950 text-white/50 pl-10 w-full'
                                style={{paddingLeft: '40px'}}
                            />
                        </div>
                        {showEmailError ? <p style={{color: 'red'}}>Email is invalid!</p> : null}
                    </fieldset>
                    <fieldset>
                        <label className='text-sm text-white/60'>Password</label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
                                <LockIcon className="size-5 text-gray-400"/>
                            </div>
                            <input 
                                type='password' 
                                value={password} 
                                name='password' 
                                onChange={(e)=>handlePasswordInput(e.target.value)} 
                                required 
                                className='bg-zinc-950 text-white/50 pl-10 w-full'
                                style={{paddingLeft: '40px'}}
                            />
                        </div>
                        {showPasswordError ? <p style={{color: 'red'}}>Password is invalid!</p> : null}
                    </fieldset>
                    <button type='button' onClick={handleRegister} className='mt-2'>Register</button>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <div className={`pl-4 grid grid-cols-[20px_1fr] gap-2 ${validations.upper ? 'text-orange-500' : ''}`}>
                        {validations.upper ? <IconsLibrary.Checkmark /> : <div className='w-4 h-4 border border-white/60 rounded-full' />}
                        <p>One upper case character</p>
                    </div>
                    <div className={`pl-4 grid grid-cols-[20px_1fr] gap-2 ${validations.lower ? 'text-orange-500' : ''}`}>
                        {validations.lower ? <IconsLibrary.Checkmark /> : <div className='w-4 h-4 border border-white/60 rounded-full' />}
                        <p>One lower case character</p>
                    </div>
                    <div className={`pl-4 grid grid-cols-[20px_1fr] gap-2 ${validations.number ? 'text-orange-500' : ''}`}>
                        {validations.number ? <IconsLibrary.Checkmark /> : <div className='w-4 h-4 border border-white/60 rounded-full' />}
                        <p>At least one number</p>
                    </div>
                    <div className={`pl-4 grid grid-cols-[20px_1fr] gap-2 ${validations.symbol ? 'text-orange-500' : ''}`}>
                        {validations.symbol ? <IconsLibrary.Checkmark /> : <div className='w-4 h-4 border border-white/60 rounded-full' />}
                        <p>At least one special character</p>
                    </div>
                    <div className={`pl-4 grid grid-cols-[20px_1fr] gap-2 ${validations.length ? 'text-orange-500' : ''}`}>
                        {validations.length ? <IconsLibrary.Checkmark /> : <div className='w-4 h-4 border border-white/60 rounded-full' />}
                        <p>At least 12 characters</p>
                    </div>
                </div>
            </form>
            <div className='text-sm text-white/60 mt-auto mb-4'>Have an account already? <b onClick={toLogin}>Log in</b> instead</div>
        </div>
    )
}

export default Register;