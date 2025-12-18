import { Route, Routes } from 'react-router-dom';
import './App.css'
import Navigation from './components/Navigation/Navigation.tsx';
import LocalList from './pages/LocalList/LocalList.tsx';
import Settings from './pages/Settings/Settings.tsx';
import { NotificationDisplay } from './Notification/NotificationDisplay.tsx';
import { useEffect, useState } from 'react';
import Groups from './pages/Groups/Groups.tsx';
import ViewGroup from './pages/ViewGroup/ViewGroup.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import Welcome from './components/Welcome/Welcome.tsx';
import ViewList from './pages/ViewGroup/Lists/ViewList/ViewList.tsx';
import Lists from './pages/ViewGroup/Lists/Lists.tsx';
import { NotificationService } from './helpers/NotificationService.ts';
import Notifications from './pages/Notifications/Notifications.tsx';
import Manage from './pages/ViewGroup/Manage/Manage.tsx';
import AcceptInvite from './pages/Groups/AcceptInvite/AcceptInvite.tsx';
import GroupDashboard from './pages/ViewGroup/GroupDashboard/GroupDashboard.tsx';
import Activity from './pages/Groups/Activity/Activity.tsx';
import Dashboard from './pages/Dashboard/Dashboard.tsx';


function App() {
  const [showNewUserPrompt, setShowNewUserPrompt] = useState(false);
  const [userId, setUserId] = useState<null | string>(null)


  useEffect(()=>{
    const username = localStorage.getItem('username');

    if(!username) {
      setShowNewUserPrompt(true);
    }
    setUserId(localStorage.getItem("userId"));
  },[]);

  useEffect(()=>{
    if(!userId) return;
    const checkReminders = () => {
      NotificationService.checkLocalReminders(userId);
    };
    checkReminders();

    const intervalId = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(intervalId);
    

  },[userId])

  return (
    <div className="app-container">
      <UserProvider>
        {showNewUserPrompt ? <Welcome close={()=>setShowNewUserPrompt(false)} /> : null}
        <NotificationDisplay />
        <main className="content">
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/lists/:id" element={<LocalList />} />
            <Route path="/group/:groupId" element={<ViewGroup />}>
              <Route index element={<GroupDashboard />} />            
              <Route path='lists' element={<Lists />} />            
              <Route path='activity' element={<Activity />} />            
              <Route path="lists/:listId" element={<ViewList />} />  
              <Route path='manage' element={<Manage />} />            
            </Route>        
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invite" element={<AcceptInvite />} />
          </Routes>
        </main>
        <Navigation />
      </UserProvider>
    </div>
  )
}

export default App
