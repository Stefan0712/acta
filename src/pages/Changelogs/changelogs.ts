import type { Changelog } from "../../types/models";

export const CHANGELOGS_ITEMS: Changelog[] = [
    {
        date: '18 Jan 2026',
        description: 'Added background syncing and caching of API data',
        listItems: [
            'Created a new Dexie table for syncQueue, where sync actions are stored',
            'Created a syncWorker that handles pushing data to the API when the user is connected to the internet',
            'Created a syncService that pulls data from the API and caches it for faster loading times',
            'Created an offlineManager that handles creating data while offline by optimistically saving locally and creating a sync action for syncing with the API',
            'Reworked all online components to use the new functions for creating and viewing data'
        ]
    },
    {
        date: '14 Jan 2026',
        description: 'Reworked New Item component',
        listItems: [
            'Reordered buttons and inputs',
            'Added more labels to make it easier to understand what that input does',
            'Moved Claim, Tags, and Priority buttons at the bottom',
            'Replaced Priority Dropdown with a button circling through priorities',
            'Changed the entire background and made it cover the entire width of the viewport',
            'Moved qty and unit on the same row with Item Name when New Item is expanded'
        ]
    },
    {
        date: '13 Jan 2026',
        description: 'This is the start of the offline-first "engine".',
        listItems: [
            'Added a button and a function to copy a list from a group to the local database',
            'Added a button to "refresh" the cloned list with the lastest data from the original',
            'Added a text showing when the list was updated last time that appears only for clones lists',
            'Combined uncompleted and completed lists to be shown at the same time'
        ]
    },
    {
        date: '12 Jan 2026',
        description: "Worked on a system for inviting users by their username",
        listItems: [
            'Created controllers and routes for sending an invite to a user by its username',
            'Created controllers and routes for accepting or declining a group invite',
            'Moved the invite modal inside the Manage Group page. Made it smaller and now it is a collapsible section instead of a separate modal',
            'Created service functions for getting, sending, and answering a group invite',
            'Added group invites to Notifications page',
            'Created new Group Invite components'
        ]
    },
        {
        date: '11 Jan 2026',
        description: "API work",
        listItems: [
            'Moved API to Vercel',
            'Reworked "protect" function from the API',
            'Created and update vercel config file.',
            'Switched to a MongoDb cluster and updated connection code'
        ]
    },
    {
        date: '8 Jan 2026',
        description: "Reworked Manage Group page",
        listItems: [
            'Added group info at the top of this page',
            'Moved the edit button near the group name',
            'Moved the Invite Members button right before the Members section',
            'Added a search bar for finding users by their username',
            'Added a "Kick user" button inside Manage User',
        ]
    },
    {
        date: '7 Jan 2026',
        description: 'This update focuses on fixing front-end issues and small improvements',
        listItems: [
            'Change default list color from white to a darker one', 
            'Increate Poll title length from 50 to 140 characters',
            'Increased List Item name from 50 to 100',
            'Pressing the Enter key while focused on Item name input will add that item',
            'Replaced the old and big Categories component with a more minimal dropdown menu',
            'Moved "Show More" button on the same row with the dropdown filter',
            'Replaced Summaries component with a hardcoded and customized progress bar inside View List',
            'Moved Edit, Delete, and Restore button at the bottom of the List Info section render them conditionally',
            'Fixed Logout button having flex column as direction instead of row',
            'Fixed Item description not showing for Group list items',
            'Fixed types in Edit poll. Removed unnecessary text and reordered elements a bit. Fixed wrong height of already addded options',
            'Updated New poll the same way as Edit Poll',
            'Created endPoll function in pollService file. Added a confirmation modal for ending the poll',
            'Fixed completed items counter not being updated for group lists',
            'Remove the bottom border of app header',
            'Removed the number of items from Summaries',
            'Moved buttons for managing a group to Manage Group page. Replaced Group settings button from the header with Activity button',
            'Shrunk button height from app menu',
            'Reworked the entire permission checking system in the API',
            'Fixed multiple smaller bugs in the API',
            'Created functions for kicking and promoting users',
            'Improved Manage Group page'
        ]
    }
]