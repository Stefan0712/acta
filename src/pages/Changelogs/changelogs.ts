import type { Changelog } from "../../types/models";

export const CHANGELOGS_ITEMS: Changelog[] = [
    {
        date: '7 Jan 10:55',
        description: 'Minor fixes.',
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
            
        ]
    }
]