import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css'
import Navigation from './components/Navigation/Navigation.tsx';
import LocalList from './pages/LocalList/LocalList.tsx';
import Settings from './pages/Settings/Settings.tsx';
import { NotificationDisplay } from './Notification/NotificationDisplay.tsx';
import { useEffect, useState } from 'react';
import Groups from './pages/Groups/Groups.tsx';
import ViewGroup from './pages/ViewGroup/ViewGroup.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import ViewList from './pages/ViewGroup/Lists/ViewList/ViewList.tsx';
import Lists from './pages/ViewGroup/Lists/Lists.tsx';
import { NotificationService } from './helpers/NotificationService.ts';
import Notifications from './pages/Notifications/Notifications.tsx';
import Manage from './pages/ViewGroup/Manage/Manage.tsx';
import AcceptInvite from './pages/Groups/AcceptInvite/AcceptInvite.tsx';
import GroupDashboard from './pages/ViewGroup/GroupDashboard/GroupDashboard.tsx';
import Activity from './pages/Groups/Activity/Activity.tsx';
import Notes from './pages/ViewGroup/Notes/Notes.tsx';
import Polls from './pages/ViewGroup/Polls/Polls.tsx';
import NewUserFlow from './pages/NewUserFlow/NewUserFlow.tsx';
import Export from './pages/Export/Export.tsx';
import Import from './pages/Import/Import.tsx';
import Welcome from './pages/NewUserFlow/Welcome/Welcome.tsx';
import About from './pages/About/About.tsx';


function App() {

  const userId = localStorage.getItem("userId");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('userId') && !!localStorage.getItem('username');
  });

  useEffect(()=>{
    if(!userId) return;
    const checkReminders = () => {
      NotificationService.checkLocalReminders(userId);
    };
    checkReminders();

    const intervalId = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(intervalId);

  },[userId])

  if (!isAuthenticated) {
    return (<NewUserFlow onLoginSuccess={()=>setIsAuthenticated(true)} />)
  } else {
    return (
      <div className="app-container">
        <UserProvider>
          <NotificationDisplay />
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/lists" replace />} />
              <Route path='/welcome' element={<Welcome />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/lists/:id" element={<LocalList />} />
              <Route path="/group/:groupId" element={<ViewGroup />}>
                <Route index element={<GroupDashboard />} />            
                <Route path='lists' element={<Lists />} />            
                <Route path='notes' element={<Notes />} />            
                <Route path='polls' element={<Polls />} />            
                <Route path='activity' element={<Activity />} />            
                <Route path="lists/:listId" element={<ViewList />} />  
                <Route path='manage' element={<Manage />} />            
              </Route>        
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invite" element={<AcceptInvite />} />
              <Route path="/export" element={<Export />} />
              <Route path="/import" element={<Import />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Navigation />
        </UserProvider>
      </div>
    )
  }
}

export default App
