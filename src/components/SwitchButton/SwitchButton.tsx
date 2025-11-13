
interface SwitchButtonProps {
    onPress: ()=> void;
    isActivated: boolean;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({onPress, isActivated}) => {
    const buttonStyle = {
        width: "40px",
        height: "25px",
        display: "flex",
        alignItems: "center",
        borderRadius: "50px",
        backgroundColor: "lightgray",
        border: "1px solid lightgray",
        transition: "all 0.2s",
    };
    const ballStyle = {
        width: "21px",
        height: "21px",
        borderRadius: "50px",
        backgroundColor: isActivated ? "green" : "black",
        transform: isActivated ? "translateX(15px)" : "translateX(0px)",
        transition: "all 0.2s"
    }
    return ( 
        <button style={buttonStyle} onClick={onPress}>
            <div style={ballStyle}></div>
        </button>
     );
}
 
export default SwitchButton;