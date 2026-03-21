// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// font
import "@fontsource/poppins/400.css"; // Regular
import "@fontsource/poppins/700.css"; // Bold


import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";


import PesertaForm from "./pages/PesertaForm";
import ScrollToTop from "./components/ScrollToTop";

//admin
import DetailPeserta from "./components/admin/DetailPeserta";
import Peserta from "./components/admin/Peserta";
import BaganPage from "./pages/BaganPage";
import MatchPage from "./pages/MatchPage";
import Settings from "./pages/Settings";
import JadwalPage from "./pages/JadwalPage";
import BaganView from "./pages/BaganView";
import JuaraPage from "./pages/JuaraPage";
import SkorPage from "./pages/SkorPage";
import Tournament from "./pages/admin/Tournament";
import PesertaGanda from "./components/admin/PesertaGanda"; 
import UiSettings from "./pages/UiSettings";
import Profile from "./pages/admin/Profile";



//landing page
import TournamentUser from "./pages/user/TournamentUser";
import ContactPage from "./pages/user/ContactPage";
import TournamentDetailPage from "./components/TournamentDetailPage";
import News from "./pages/user/News";
import NewsDetail from "./pages/user/NewsDetail";
import Visimisi from "./pages/user/Visimisi";
import Struktur  from "./pages/user/Struktur";
import Kepengurusan from "./pages/user/Kepengurusan";
import Athlete  from "./pages/user/Athlete";
import Club from "./pages/user/Club";




export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          <Route index element={<Home />} />
        
          <Route path="/login" element={<Login />} />
          <Route path="/daftar-peserta" element={<PesertaForm/>}/>
          <Route path="/tournament" element={<TournamentUser/>}/>
          <Route path="/contact" element={<ContactPage/>}/>
          <Route path="/berita" element={<News/>}/>
          <Route path="/berita/:slug" element={<NewsDetail/>}/>
          <Route path="/visi-misi" element={<Visimisi/>}/>
          <Route path="/struktur-organisasi" element={<Struktur/>}/>
          <Route path="/kepengurusan" element={<Kepengurusan/>}/>
          <Route path="/atlet" element={<Athlete/>}/>
          <Route path="/anggota" element={<Club/>}/>    
          <Route path="/tournament-detail" element={<TournamentDetailPage/>}/>
      
          <Route
            path="/admin"
            element={
             <ProtectedRoute>
                <RoleRoute allow={["admin"]}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
           
            <Route path="tournament" element={<Tournament/>}/>
            <Route path="detail-peserta/:id" element={<DetailPeserta/>}/>
            <Route path="peserta" element={<Peserta/>}/>
            <Route path="bagan-peserta" element={<BaganPage/>}/>
            <Route path="match" element={<MatchPage/>}/>
            <Route path="bagan-view/:id" element={<BaganView/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="jadwal-pertandingan" element={<JadwalPage/>}/>
            <Route path="hasil-pertandingan" element={<JuaraPage/>}/>
            <Route path="skor" element={<SkorPage/>}/>
            <Route path="peserta-ganda" element={<PesertaGanda />} />
            <Route path="uisettings" element={<UiSettings/>}/>
            <Route path="profile" element={<Profile />} />
            
          </Route>

          <Route
            path="/wasit"
            element={
              <ProtectedRoute>
                <RoleRoute allow={["wasit"]}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="peserta" element={<Peserta/>}/>
            <Route path="peserta-ganda" element={<PesertaGanda />} />
            <Route path="jadwal-pertandingan" element={<JadwalPage/>}/>
            <Route path="skor" element={<SkorPage/>}/>
            <Route path="bagan-peserta" element={<BaganPage/>}/>
            <Route path="bagan-view/:id" element={<BaganView/>}/>
          </Route>


            <Route
            path="/panitia"
            element={
              <ProtectedRoute>
                <RoleRoute allow={["panitia"]}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="peserta" element={<Peserta/>}/>
            <Route path="peserta-ganda" element={<PesertaGanda />} />
            <Route path="jadwal-pertandingan" element={<JadwalPage/>}/>
            <Route path="skor" element={<SkorPage/>}/>
            <Route path="bagan-peserta" element={<BaganPage/>}/>
            <Route path="bagan-view/:id" element={<BaganView/>}/>
            <Route path="hasil-pertandingan" element={<JuaraPage/>}/>
            <Route path="detail-peserta/:id" element={<DetailPeserta/>}/>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
