import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchClick: () => void;
  favoritesCount: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onSearchClick,
  favoritesCount,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "inicio", label: "Inicio" },
    { id: "peliculas", label: "Películas" },
    { id: "generos", label: "Géneros" },
    { id: "favoritos", label: "Mis Favoritos" },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    // Smooth scroll to target sections if they are on the page
    if (id === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // height of the fixed navbar
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <nav
      id="top-nav"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-black/90 border-b border-white/5 shadow-xl"
          : "py-5 bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-16 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <span
            id="brand-logo"
            onClick={() => handleNavClick("inicio")}
            className="font-display text-3xl md:text-4xl font-extrabold tracking-tighter text-[#E50914] cursor-pointer hover:opacity-90 select-none uppercase active:scale-95 transition-transform"
          >
            CINEMAX PRO
          </span>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative font-sans text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white scale-105"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.id === "favoritos" && favoritesCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-[#E50914] text-white rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-[#E50914] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            id="search-trigger"
            onClick={onSearchClick}
            className="p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10 active:scale-95 transition-transform"
            aria-label="Buscar películas"
          >
            <Search className="w-5 h-5" />
          </button>

          <div
            id="profile-avatar-container"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 focus-within:ring-2 focus-within:ring-[#E50914] cursor-pointer"
          >
            <img
              id="profile-avatar"
              alt="User Profile avatar"
              className="w-full h-full object-cover select-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTMo0f8AYPsa-ge5TJhkGYr3qqi--oJ_1LU1mZp7WuJn0Xydv_fQM813NYOquv3Ffj7zaWmdAByFFjyDa2CB3tt2D2Jvx9AdnHqtc0JrrLCq2Tt9MuOQp8uS5sNDanZKu_anUzM2-6I45NbMVH_ZPDU4z_h-RuRgco7A4sjy4pgILYvrqUYAWDN-PoM1hnzMwb1-e2VqzSdSS2AzlTLYWh5vR6KhEYzZEHBGXQVKLN1UycW2JWzkMhNkdhKkR7nB3NM9VCX7BuJjo"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
