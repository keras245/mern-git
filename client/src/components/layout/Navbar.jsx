import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Effet de scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "Gestion des Emplois du Temps",
      description: "Planification et modification facile des emplois du temps",
      icon: "📅",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Suivi des Présences",
      description: "Suivi en temps réel de la présence des enseignants",
      icon: "📊",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Communication",
      description: "Système de notification et de feedback",
      icon: "💬",
      color: "from-purple-500 to-violet-600"
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  UNC
                </span>
                <div className="text-xs text-gray-500 -mt-1">Génie Info</div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isActive={isActive('/')} label="Accueil" />
            
            {/* Menu Fonctionnalités avec dropdown */}
            <div className="relative">
              <motion.button
                onMouseEnter={() => setShowFeatures(true)}
                onMouseLeave={() => setShowFeatures(false)}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/features')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="flex items-center gap-1">
                  Fonctionnalités
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </motion.button>
              
              <AnimatePresence>
                {showFeatures && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setShowFeatures(true)}
                    onMouseLeave={() => setShowFeatures(false)}
                    className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50"
                  >
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                            <span className="text-lg">{feature.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/about" isActive={isActive('/about')} label="À propos" />
            <NavLink to="/contact" isActive={isActive('/contact')} label="Contact" />
            
            {/* Bouton de connexion stylé */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-600 hover:to-indigo-700"
              >
                Se connecter
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              <MobileNavLink to="/" label="Accueil" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/about" label="À propos" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2"
              >
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg"
                >
                  Se connecter
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Composant NavLink pour desktop
const NavLink = ({ to, isActive, label }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-blue-600 bg-blue-50 shadow-sm'
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </Link>
  </motion.div>
);

// Composant NavLink pour mobile
const MobileNavLink = ({ to, label, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Link
      to={to}
      onClick={onClick}
      className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-colors"
    >
      {label}
    </Link>
  </motion.div>
);

export default Navbar;