import { useEffect, useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import styles from '../NewPoll/NewPoll.module.css';
import type { Poll, PollOption } from '../../../../types/models';
import SwitchButton from '../../../../components/SwitchButton/SwitchButton';
import { addPollOption, getPollById, updatePoll } from '../../../../services/pollService';
import { useParams } from 'react-router-dom';
import Loading from '../../../../components/LoadingSpinner/Loading';

const EditPoll = ({handleUpdatePoll, close, pollId}: {handleUpdatePoll: (updatedPoll: Poll)=>void, close: ()=>void, pollId: string}) => {

    const {groupId} = useParams();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endHour, setEndHour] = useState('');
    const [options, setOptions] = useState<PollOption[]>([]);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [allowCustomOptions, setAllowCustomOptions] = useState(false);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getFreshPollData = async () =>{
        try {
            const apiResponse = await getPollById(pollId);
            if(apiResponse._id){
                setTitle(apiResponse.title ?? '');
                setDescription(apiResponse.description ?? '');
                setOptions(apiResponse.options ?? []);
                setAllowCustomOptions(apiResponse.allowCustomOptions ?? false);
                if(apiResponse.expiresAt) {
                    const isoString = new Date(apiResponse.expiresAt).toISOString(); 
                    const [datePart, timePart] = isoString.split('T');
                    setEndDate(datePart);
                    setEndHour(timePart.substring(0, 5));
                }
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(()=> {
        getFreshPollData();
    },[pollId])


    const handleTitleInput = (value: string) => {
        setTitle(value)
        setTitleError(null)
    };

    const handleRemoveOption = (id: string) =>{
        setOptions(prev=>[...prev.filter(item=>item._id!==id)]);
    }

    const handleAdd = async () =>{
        if(!title || title.length < 1 || title.length > 30){
            setTitleError("Title invalid. Must be between 1 and 30 characters");
        }else if(options.length < 2){
            setOptionsError("A poll MUST have at least two options.")
        } else if (groupId) {
            const updatedPoll = {
                title,
                description,
                options,
                allowCustomOptions,
                expiresAt: new Date(`${endDate}T${endHour}`),
            }
            try {
                const apiResponse: Poll = await updatePoll(pollId, updatedPoll);
                handleUpdatePoll(apiResponse);
                close();
            } catch (error) {
                console.error(error)
            }
        }
    }
    if(isLoading){
        return ( 
            <div className={styles.newPollBackground}>
                <Loading /> 
            </div>
        )
    }else {
        return (
            <div className={styles.newPollBackground}>
                <div className={styles.newPoll}>
                    <div className={styles.header}>
                        <h1>New Poll</h1>
                        <button onClick={close}><IconsLibrary.Close /></button>
                    </div>
                    <div className={styles.inputs}>
                        <fieldset>
                            <label>Title</label>
                            <input type='text' name='title' value={title} onChange={(e)=>handleTitleInput(e.target.value)} placeholder='What is this poll about?'></input>
                            {titleError ? <p className='error-message'>{titleError}</p> : null}
                        </fieldset>
                        <fieldset>
                            <label>Description</label>
                            <input type='text' name='description' value={description} onChange={(e)=>setDescription(e.target.value)} placeholder='Add some context (optional)'></input>
                        </fieldset>
                        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                            <label>Allow custom optinos?</label>
                            <SwitchButton isActivated={allowCustomOptions} onPress={()=>setAllowCustomOptions(prev=>!prev)} />
                        </div>
                        <b>ENDS AT</b>
                        <div className={styles.due}>
                            <fieldset>
                                <label>Date</label>
                                <input type='date' name='date' value={endDate} onChange={(e)=>setEndDate(e.target.value)}></input>
                            </fieldset>
                            <fieldset>
                                <label>Time</label>
                                <input type='time' name='hour' value={endHour} onChange={(e)=>setEndHour(e.target.value)}></input>
                            </fieldset>
                        </div>
                        <b>OPTIONS</b>
                        {optionsError ? <p className='error-message'>{optionsError}</p> : null}
                        <div className={styles.options}>
                            {options?.map((option,index)=><Option key={option._id} data={option} handleRemove={handleRemoveOption} index={index} />)}
                            <NewOption pollId={pollId} addOption={(newOption)=>setOptions(prev=>[...prev, newOption])} totalOptions={options.length}/>
                        </div>
                    </div>
                <button className={styles.startPollButton} onClick={handleAdd}>Start Poll</button>
                </div>
            </div>
        )
    }
}

export default EditPoll;


interface OptionProps {
    data: PollOption;
    handleRemove: (id: string) => void;
    index: number;
}
const Option: React.FC<OptionProps> = ({data, handleRemove, index}) => {


    return (
        <div className={styles.option}>
            <p>{index+1}</p>
            <h2>{data.text}</h2>
            <button onClick={()=>data._id ? handleRemove(data._id) : null}><IconsLibrary.Close /></button>
        </div>
    )
}

interface NewOptionProps {
    addOption: (option: PollOption) => void;
    pollId: string;
    totalOptions: number;
}

const NewOption: React.FC<NewOptionProps> = ({addOption, totalOptions, pollId}) => {

    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);



    const handleAdd = async () => {
         if(!text || text.length < 1 || text.length > 50) {
            setError("Option invalid. It should be between 1 and 50 characters.")
        } else {
            try {
                const apiResponse = await addPollOption(pollId, text);
                if(apiResponse._id) {
                    addOption(apiResponse);
                    setText('');
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
    

    return (
        <div className={styles.newOption}>
            <p>{totalOptions +1}</p>
            <input type='text' value={text} onChange={(e)=>setText(e.target.value)} style={error ? {color: 'red', borderColor: 'red'} : {}} placeholder={error ? error : 'Add option...'} />
            <button onClick={handleAdd}><IconsLibrary.Plus /></button>
        </div>
    )
}