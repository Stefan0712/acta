import { Route, Routes } from 'react-router-dom';
import './App.css'
import Navigation from './components/Navigation/Navigation.tsx';
import ShoppingLists from './pages/ShoppingLists/ShoppingLists.tsx';
import ShoppingList from './pages/ShoppingList/ShoppingList.tsx';
import Products from './pages/Products/Products.tsx';
import Settings from './pages/Settings/Settings.tsx';
import { NotificationDisplay } from './Notification/NotificationDisplay.tsx';


function App() {

  return (
    <div className="app-container">
      <NotificationDisplay />
      {/* This is the main content area */}
      <main className="content">
        <Routes> {/* <-- This is your router */}
          <Route path="/" element={<ShoppingLists />} />
          <Route path="/list/:id" element={<ShoppingList />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <Navigation />
    </div>
  )
}

export default App
