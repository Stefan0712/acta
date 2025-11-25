// import { ObjectId } from 'bson';
// import { type ActivityLog } from './../types/models';


// const sendActivityLog = ({log}: {log: ActivityLog}) => {
//     console.log(log);
// }



// const sendGroupActivityLog = (
//     {message, groupId, authorId, authorName, metadata}: {
//         message: string,
//         groupId: string,
//         authorId: string,
//         authorName: string,
//         metadata?: {
//             listId?: string;
//             itemId?: string;
//             noteId?: string;
//             pollId?: string;
//         }
// }) => {
//     const newLog: ActivityLog = {
//         _id: new ObjectId().toString(),
//         createdAt: new Date(),
//         message,
//         category: "GROUP",
//         groupId,
//         authorId,
//         authorName
//     }
//     if(metadata){
//         newLog.metadata = metadata;
//     }
//     console.log(newLog);
// }