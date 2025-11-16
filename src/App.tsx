import { Route, Routes } from 'react-router-dom';
import './App.css'
import Navigation from './components/Navigation/Navigation.tsx';
import ShoppingLists from './pages/ShoppingLists/ShoppingLists.tsx';
import ShoppingList from './pages/ShoppingList/ShoppingList.tsx';
import Products from './pages/Products/Products.tsx';
import Settings from './pages/Settings/Settings.tsx';
import { NotificationDisplay } from './Notification/NotificationDisplay.tsx';
import { useEffect } from 'react';
import { ObjectId } from 'bson';
import Groups from './pages/Groups/Groups.tsx';
import ViewGroup from './pages/ViewGroup/ViewGroup.tsx';


function App() {
  useEffect(()=>{
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = new ObjectId().toString();
      localStorage.setItem('userId', userId);
    }
  },[]);

  return (
    <div className="app-container">
      <NotificationDisplay />
      <main className="content">
        <Routes>
          <Route path="/" element={<ShoppingLists />} />
          <Route path="/list/:id" element={<ShoppingList />} />
          <Route path="/group/:id" element={<ViewGroup />} />
          <Route path="/products" element={<Products />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  )
}

export default App
