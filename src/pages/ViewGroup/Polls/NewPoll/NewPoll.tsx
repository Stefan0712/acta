import { useState } from 'react';
import { IconsLibrary } from '../../../../assets/icons';
import styles from './NewPoll.module.css';
import SwitchButton from '../../../../components/SwitchButton/SwitchButton';
import { useParams } from 'react-router-dom';
import { ObjectId } from 'bson';
import { offlineCreate } from '../../../../services/offlineManager';
import { db } from '../../../../db';
import type { PollOption } from '../../../../types/models';


const NewPoll = ({close}: {close: ()=>void}) => {

    const {groupId} = useParams();
    const userId = localStorage.getItem('userId');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endHour, setEndHour] = useState('');
    const [options, setOptions] = useState<PollOption[]>([]);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [allowCustomOptions, setAllowCustomOptions] = useState(false);
    const [optionsError, setOptionsError] = useState<string | null>(null)

    const handleTitleInput = (value: string) => {
        setTitle(value)
        setTitleError(null)
    };



    const handleRemoveOption = (pollId: string) =>{
        setOptions(prev=>[...prev.filter(item=>item._id!==pollId)]);
    }

    const handleAdd = async () =>{
        if(!title || title.length < 1 || title.length > 140){
            setTitleError("Title invalid. Must be between 1 and 140 characters");
        }else if(options.length < 2){
            setOptionsError("A poll MUST have at least two options.")
        } else if (groupId && userId) {
            const newPoll = {
                _id: new ObjectId().toHexString(),
                title,
                description,
                options,
                groupId,
                allowCustomOptions,
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(`${endDate}T${endHour}`),
                authorId: userId,
                authorUsername: localStorage.getItem('username') ?? 'Unknown user'
            }
            try {
                console.log("Creating poll offline", newPoll);
                await offlineCreate(db.polls, newPoll, "CREATE_POLL");
                close();
            } catch (error) {
                console.error(error)
            }
        }
    }
    return (
        <div className={styles.newPollBackground}>
            <div className={styles.newPoll}>
                <div className={styles.header}>
                    <h1>New Poll</h1>
                    <button onClick={close}><IconsLibrary.Close /></button>
                </div>
                <div className={styles.inputs}>
                    <input type='text' name='title' value={title} onChange={(e)=>handleTitleInput(e.target.value)} placeholder='Poll title...'></input>
                        {titleError ? <p className='error-message'>{titleError}</p> : null}
                        <input type='text' name='description' value={description} onChange={(e)=>setDescription(e.target.value)} placeholder='Poll description...'></input>
                        <b>Ends at</b>
                        <div className={styles.due}>
                            <input type='date' name='date' value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                            <input type='time' name='hour' value={endHour} onChange={(e)=>setEndHour(e.target.value)} />
                        </div>
                        <b>OPTIONS</b>
                        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                            <label>Allow custom options?</label>
                            <SwitchButton isActivated={allowCustomOptions} onPress={()=>setAllowCustomOptions(prev=>!prev)} />
                        </div>
                    {optionsError ? <p className='error-message'>{optionsError}</p> : null}
                    <div className={styles.options}>
                        {options?.map((option,index)=><Option key={option._id} data={option} handleRemove={handleRemoveOption} index={index} />)}
                        <NewOption addOption={(newOption)=>setOptions(prev=>[...prev, newOption])} totalOptions={options.length}/>
                    </div>
                </div>
            <button className={styles.startPollButton} onClick={handleAdd}>Start Poll</button>
            </div>
        </div>
    )
}

export default NewPoll;


interface OptionProps {
    data: PollOption;
    handleRemove: (pollId: string) => void;
    index: number;
}
const Option: React.FC<OptionProps> = ({data, handleRemove, index}) => {


    return (
        <div className={styles.option}>
            <p>{index+1}</p>
            <h2>{data.text}</h2>
            <button onClick={()=>handleRemove(data._id)}><IconsLibrary.Close /></button>
        </div>
    )
}

interface NewOptionProps {
    addOption: (option: PollOption) => void;
    totalOptions: number;
}

const NewOption: React.FC<NewOptionProps> = ({addOption, totalOptions}) => {

    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        if(!text || text.length < 1 || text.length > 140) {
            setError("Option invalid. It should be between 1 and 50 characters.")
        }
        const newOption = {
            _id: new ObjectId().toHexString(),
            text: text,
            votes: []
        }
        addOption(newOption);
        setText('');
    }

    return (
        <div className={styles.newOption}>
            <p>{totalOptions +1}</p>
            <input type='text' value={text} onChange={(e)=>setText(e.target.value)} style={error ? {color: 'red', borderColor: 'red'} : {}} placeholder={error ? error : 'Add option...'} />
            <button onClick={handleAdd}><IconsLibrary.Plus /></button>
        </div>
    )
}