import { useState } from 'react';
import styles from './NewUserFlow.module.css';
import { ArrowBigLeft, ArrowBigRight, Flag, Info } from 'lucide-react';
import Step1 from './Step1/Step1';
import Auth from '../Auth/Auth';

type Step = 1 | 2 ;

interface NewUserFlowProps {
    onLoginSuccess: () => void;
}
const NewUserFlow: React.FC<NewUserFlowProps> = ({onLoginSuccess}) => {


    const [step, setStep] = useState<Step>(1);

    const nextStep = () => {
        if(step < 2) {
            setStep(prev=>prev+1 as Step)
        }
    }
    const prevStep = () => {
        if(step > 1){
            setStep(prev=>prev-1 as Step)
        }
    }
    return (
        <div className={styles.newUserFlow}>
            <div className={styles.header}>
                <button>
                    <Info />
                </button>
                <h1>Get Started</h1>
                <button>
                    <Flag />
                </button>
            </div>
            <div className={styles.stepContainer}>
                {step === 1 ? <Step1 onLoginSuccess={onLoginSuccess} next={nextStep}/> : step === 2 ? <Auth onLoginSuccess={onLoginSuccess} />  : null}
            </div>
            <div className={styles.stepNavigator}>
                <button onClick={prevStep} className='flex items-center justify-center'>
                    <ArrowBigLeft />
                </button>
                <div className={styles.stepsCircles}>
                    <div className={`${styles.circle} cursor-pointer ${step === 1 ? styles.currentStep : ''}`} onClick={()=>setStep(1)}><p>1</p></div>
                    <div className={`${styles.circle} cursor-pointer ${step === 2 ? styles.currentStep : ''}`} onClick={()=>setStep(2)}><p>2</p></div>
                </div>
                <button onClick={nextStep} className='flex items-center justify-center'>
                    <ArrowBigRight />
                </button>
            </div>
        </div>
    )
}

export default NewUserFlow;