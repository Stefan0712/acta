import { Route, Routes } from 'react-router-dom';
import './App.css'
import Navigation from './components/Navigation/Navigation.tsx';
import ShoppingLists from './pages/ShoppingLists/ShoppingLists.tsx';
import ShoppingList from './pages/ShoppingList/ShoppingList.tsx';
import Products from './pages/Products/Products.tsx';
import Settings from './pages/Settings/Settings.tsx';
import { NotificationDisplay } from './Notification/NotificationDisplay.tsx';
import { useEffect, useState } from 'react';
import Groups from './pages/Groups/Groups.tsx';
import ViewGroup from './pages/ViewGroup/ViewGroup.tsx';
import { ObjectId } from 'bson';
import { UserProvider } from './contexts/UserContext.tsx';
import Welcome from './components/Welcome/Welcome.tsx';
import ViewList from './pages/ViewGroup/Lists/ViewList/ViewList.tsx';
import Lists from './pages/ViewGroup/Lists/Lists.tsx';


function App() {
  const [showNewUserPrompt, setShowNewUserPrompt] = useState(false);


  useEffect(()=>{
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if(!username) {
      setShowNewUserPrompt(true);
    }
    if(!userId) {
      const newId = new ObjectId().toString();
      localStorage.setItem("userId", newId);
    }
  },[]);

  return (
    <div className="app-container">
      <UserProvider>
        {showNewUserPrompt ? <Welcome close={()=>setShowNewUserPrompt(false)} /> : null}
        <NotificationDisplay />
        <main className="content">
          <Routes>
            <Route path="/" element={<ShoppingLists />} />
            <Route path="/list/:id" element={<ShoppingList />} />
            <Route path="/group/:groupId" element={<ViewGroup />}>
              <Route index element={<Lists />} />            
              <Route path='lists' element={<Lists />} />            
              <Route path="lists/:listId" element={<ViewList />} />  
            </Route>        
            <Route path="/products" element={<Products />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Navigation />
      </UserProvider>
    </div>
  )
}

export default App
