import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from './components/Layout';
import Home from './pages/Home';
import Score from './pages/Score';
import LoginRegister from './pages/LoginRegister';
import Standings from './pages/Standings';
import History from './pages/History';
import Admin from './pages/Admin';
import NoPage from './pages/NoPage';
import { AuthProvider } from "./data/AuthProvider";
import { UsersDataProvider } from "./data/UsersDataProvider";
import { CoursesDataProvider } from "./data/CoursesDataProvider";
import { TournamentsDataProvider } from "./data/TournamentsDataProvider";
import { ScorecardsDataProvider } from "./data/ScorecardsDataProvider";
import { MatchesDataProvider } from './data/MatchesDataProvider';
import AdminScorecards from "./components/AdminScorecards";
import UsersTable from "./components/UsersTable";
import CurrentRound from "./components/CurrentRound";
import AdminTournaments from "./components/AdminTournaments";

function AppRouter() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<LoginRegister />} />
            <Route path="score" element={<Score />} />
            <Route path="standings" element={<Standings />} />
            <Route path="admin" element={<Admin />}>
              <Route index element={<Navigate to="current-round" replace />} />
              <Route path="users" element={<UsersTable />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="scorecards" element={<AdminScorecards />} />
              <Route path="current-round" element={<CurrentRound />} />
            </Route>
            <Route path="history" element={<History />} />
            <Route path="*" element={<NoPage />} />
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
              <MatchesDataProvider>
                <AppRouter />
              </MatchesDataProvider>
            </ScorecardsDataProvider>
          </TournamentsDataProvider>
        </CoursesDataProvider>
      </UsersDataProvider>
    </AuthProvider>
  )

}

export default App;
