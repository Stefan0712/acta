import { Link } from 'react-router-dom';
import { IconsLibrary } from '../../assets/icons';
import { formatRelativeTime, getDateAndHour } from '../../helpers/dateFormat';
import styles from './Dashboard.module.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useEffect, useState } from 'react';
import { type ShoppingList, type Notification} from '../../types/models';
import { getIcon } from '../../components/IconSelector/iconCollection';

// TODO: Add listId to notes so that the user can link them to a certain list
// TODO: Add a section with latest notes

const Dashboard = () => {

    const username = localStorage.getItem("username");

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <p>{getDateAndHour(new Date())}</p>
                    {username ? <h3>Hello {username}</h3> : null}
                </div>
                <Link to={'/notifications'}>
                    <IconsLibrary.Bell />
                </Link>
            </div>
            <div className={styles.dashboardContent}>
                <h4>Pinned Lists</h4>
                    <PinnedLists />
                <h4>Due Items</h4>
                    <DueItems />
                <h4>Recent Notifications</h4>
                    <RecentNotifications />
                {/* <h4>Latest Notes</h4>
                    <LatestNotes /> */}
            </div>
        </div>
    )
}

export default Dashboard;

const DueItems = () => {
    return (
        <div className={styles.dueItems}>
            <div className={styles.dueItem}>
                <div className={styles.dueItemInfo}>
                    <b>Milk</b>
                    <p>Groceries</p>
                </div>
                <p className={styles.dueDate}>Today</p>
            </div>
            <div className={styles.dueItem}>
                <div className={styles.dueItemInfo}>
                    <b>Milk</b>
                    <p>Groceries</p>
                </div>
                <p className={styles.dueDate}>Today</p>
            </div>
            <div className={styles.dueItem}>
                <div className={styles.dueItemInfo}>
                    <b>Milk</b>
                    <p>Groceries</p>
                </div>
                <p className={styles.dueDate}>Today</p>
            </div>
        </div>
    )
}

const RecentNotifications = () => {
    const notifications = useLiveQuery(async () => {
        return await db.notifications
        .orderBy("createdAt")
        .reverse()
        .limit(5)
        .toArray();
    });

    if (!notifications) return <p>Loading...</p>;

    return (
        <div className={styles.recentNotifications}>
            {notifications  && notifications.length > 0 ? notifications.map((item: Notification)=><Notification data={item} />) : <p>No notifications</p>}
             
        </div>
    )
}
const Notification = ({data} : {data: Notification}) =>{

    return (
        <div className={styles.notification}>
            <p className={styles.message}>{data.message ?? 'Failed to get notification content!'}</p>
            <p className={styles.timestamp}>{formatRelativeTime(data.createdAt ?? new Date())}</p>
        </div>
    )
}


const PinnedLists = () => {
    
    const [lists, setLists] = useState<ShoppingList[]>([])

    const getPinnedListsData = async () => {
        try {
            const allLists = await db.shoppingLists.toArray()

            if (!allLists || allLists.length === 0) {
                setLists([]);
                return;
            }

            const updatedLists = await Promise.all(
                allLists.filter(item=>item.isPinned).map(async (list) => {
                    if (!list._id) return { ...list, totalItemsCounter: 0, completedItemsCounter: 0 };
                    const itemsInList = db.shoppingListItems.where('listId').equals(list._id);
                    
                    const totalCount = await itemsInList.filter(item => !item.isDeleted).count();

                    const completedCount = await itemsInList.filter(item => item.isChecked && !item.isDeleted).count();
                    return {
                        ...list,
                        totalItemsCounter: totalCount,
                        completedItemsCounter: completedCount
                    };
                })
            );

            setLists(updatedLists);
        } catch (error) {
            console.error("Error fetching dashboard pinned lists:", error);
        }
    };
    useEffect(()=>{
        getPinnedListsData();
    },[])



    return (
        <div className={styles.pinnedLists}>
            {lists && lists.length > 0 ? lists.map(list=>{
                const Icon = getIcon(lists.icon);
                return (
                    <div className={styles.list}>
                        <div className={styles.iconContainer}><Icon /></div>
                        <div className={styles.listInfo}>
                            <p>{list.name}</p>
                            <b>{list.completedItemsCounter}/{list.totalItemsCounter}</b>
                        </div>
                    </div>
                )
        }) : <p>No pinned lists</p>}
        </div>
    )
}

// const LatestNotes = () => {
//     const notes: Note[] = [
//         {
//             _id: 'note-1',
//             groupId: 'none',
//             authorId: localStorage.getItem('userId') ?? 'local-user-id',
//             title: "This is a note",
//             content: "You can save a note for things you want to remember",
//             createdAt: new Date(),
//             comments: [],
//             isDirty: true,
//             clientId: 'note-1'
//         },
//         {
//             _id: 'note-2',
//             groupId: 'none',
//             authorId: localStorage.getItem('userId') ?? 'local-user-id',
//             title: "This is another note",
//             content: "You can even comment on notes",
//             createdAt: new Date(),
//             comments: [{
//                 _id: 'note-comment-1',
//                 authorId: localStorage.getItem('userId') ?? 'local-user-id',
//                 username: localStorage.getItem('username') ?? 'Local User',
//                 content: "This is a nice note",
//                 createdAt: new Date(),
//                 isDirty: true,
//                 clientId: 'note-comment-1'
//             }],
//             isDirty: true,
//             clientId: 'note-1'
//         }
//     ]

//     return (
//         <div className={styles.latestNotes}>
//             {notes && notes.length > 0 ? notes.map(note=><div className={styles.note}>
//                 <h4>{note.title}</h4>
//                 <p className={styles.noteContent}>{note.content}</p>
//             </div>) : null}
//         </div>
//     )
// }