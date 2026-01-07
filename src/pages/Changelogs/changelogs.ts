import type { Changelog } from "../../types/models";

export const CHANGELOGS_ITEMS: Changelog[] = [
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

        ]
    }
]