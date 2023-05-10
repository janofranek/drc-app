import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './page/Layout';
import Home from './page/Home';
import LoginRegister from './page/LoginRegister';
import Stav from './page/Stav';
import Admin from './page/Admin';
import NoPage from './page/NoPage';
import { AuthProvider } from "./data/AuthProvider"
import { UsersDataProvider } from "./data/UsersDataProvider"
import { CoursesDataProvider } from "./data/CoursesDataProvider"
import { TournamentsDataProvider } from "./data/TournamentsDataProvider"

function AppRouter() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index element={<Home/>} />
            <Route path="login" element={<LoginRegister/>} />
            <Route path="stav" element={<Stav/>} />
            <Route path="admin" element={<Admin/>} />
            <Route path="*" element={<NoPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <UsersDataProvider>
        <CoursesDataProvider>
          <TournamentsDataProvider>
            <AppRouter/>
          </TournamentsDataProvider>
        </CoursesDataProvider>
      </UsersDataProvider>
    </AuthProvider>
  )
      
}
 
export default App;
