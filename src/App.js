import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './page/Layout';
import Home from './page/Home';
import Score from './page/Score';
import LoginRegister from './page/LoginRegister';
import Stav from './page/Stav';
import History from './page/History';
import Admin from './page/Admin';
import NoPage from './page/NoPage';
import { AuthProvider } from "./data/AuthProvider"
import { UsersDataProvider } from "./data/UsersDataProvider"
import { CoursesDataProvider } from "./data/CoursesDataProvider"
import { TournamentsDataProvider } from "./data/TournamentsDataProvider"
import { ScorecardsDataProvider } from "./data/ScorecardsDataProvider"

function AppRouter() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index element={<Home/>} />
            <Route path="login" element={<LoginRegister/>} />
            <Route path="skore" element={<Score/>} />
            <Route path="stav" element={<Stav/>} />
            <Route path="admin" element={<Admin/>} />
            <Route path="history" element={<History/>} />
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
            <ScorecardsDataProvider>
              <AppRouter/>
            </ScorecardsDataProvider>
          </TournamentsDataProvider>
        </CoursesDataProvider>
      </UsersDataProvider>
    </AuthProvider>
  )
      
}
 
export default App;
