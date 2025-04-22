import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import './index.css';

//components 
import MainLayout from './components/layout/MainLayout.jsx';

//pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true, //Matches the parent path '/'
        //element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
