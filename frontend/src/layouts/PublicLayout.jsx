import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/Footer.jsx';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">

      {/* 🔝 Navbar */}
      <Navbar />

      {/* 📄 Contenido */}
      <main className="flex-grow relative z-10">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* 📍 Footer */}
      <Footer />

    </div>
  );
};

export default PublicLayout;