import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  Plus,
  Eye,
  Save,
  Clock,
  MapPin,
  Search,
  Filter,
  Database,
  PlusCircle
} from 'lucide-react';

const ImportDonnees = () => {
  const [modeActuel, setModeActuel] = useState('consulter'); // 'consulter' ou 'importer'
  const [activeTab, setActiveTab] = useState('manual');
  const [manualData, setManualData] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sallesExistantes, setSallesExistantes] = useState([]);
  const [sallesSelectionnees, setSallesSelectionnees] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [salleSelectionnee, setSalleSelectionnee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [importedData, setImportedData] = useState([]);
  const [showImportedData, setShowImportedData] = useState(false);
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1); // 1 salle par page
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  // Créneaux horaires disponibles
  const creneauxDisponibles = [
    '08h30 - 11h30',
    '12h00 - 15h00', 
    '15h30 - 18h30'
  ];

  const joursDisponibles = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  // Configuration des modes principaux
  const modes = [
    {
      id: 'consulter',
      title: 'Consulter',
      icon: '📊',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Examiner les données de scolarité existantes'
    },
    {
      id: 'importer',
      title: 'Importer',
      icon: '📥',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Ajouter de nouvelles données de scolarité'
    }
  ];

  // Charger les salles existantes
  useEffect(() => {
    chargerSallesExistantes();
  }, []);

  const chargerSallesExistantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/salles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSallesExistantes(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des salles', 'error');
    }
  };

  // Filtrer les salles selon le terme de recherche
  const sallesFiltrees = sallesExistantes.filter(salle => 
    salle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salle.id_salle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter/retirer un créneau pour une salle
  const toggleCreneau = (salleId, jour, creneau) => {
    if (modeActuel !== 'importer') return; // Empêcher la modification en mode consultation
    
    // Vérifier si le créneau existe déjà dans les données permanentes
    const salleExistante = sallesExistantes.find(s => s.id_salle === salleId);
    if (salleExistante && salleExistante.disponibilite) {
      const jourData = salleExistante.disponibilite.find(d => d.jour === jour);
      if (jourData && jourData.creneaux.includes(creneau)) {
        showNotification('Ce créneau est déjà configuré pour cette salle', 'warning');
        return; // Empêcher la modification d'un créneau déjà existant
      }
    }
    
    setSallesSelectionnees(prev => {
      const salleIndex = prev.findIndex(s => s.id_salle === salleId);
      
      if (salleIndex === -1) {
        return [...prev, {
          id_salle: salleId,
          disponibilite: [{ jour, creneaux: [creneau] }]
        }];
      }

      const salle = { ...prev[salleIndex] };
      const disponibilite = [...salle.disponibilite];
      const jourIndex = disponibilite.findIndex(d => d.jour === jour);

      if (jourIndex === -1) {
        disponibilite.push({ jour, creneaux: [creneau] });
      } else {
        const creneaux = [...disponibilite[jourIndex].creneaux];
        const creneauIndex = creneaux.indexOf(creneau);
        
        if (creneauIndex === -1) {
          creneaux.push(creneau);
        } else {
          creneaux.splice(creneauIndex, 1);
        }

        if (creneaux.length === 0) {
          disponibilite.splice(jourIndex, 1);
        } else {
          disponibilite[jourIndex] = { jour, creneaux };
        }
      }

      salle.disponibilite = disponibilite;

      if (disponibilite.length === 0) {
        return prev.filter(s => s.id_salle !== salleId);
      }

      const newSalles = [...prev];
      newSalles[salleIndex] = salle;
      return newSalles;
    });
  };

  // Vérifier si un créneau est sélectionné
  const estCreneauSelectionne = (salleId, jour, creneau) => {
    if (modeActuel === 'consulter') {
      // En mode consultation, vérifier les données existantes
      const salle = sallesExistantes.find(s => s.id_salle === salleId);
      if (!salle || !salle.disponibilite) return false;
    const jourData = salle.disponibilite.find(d => d.jour === jour);
    return jourData ? jourData.creneaux.includes(creneau) : false;
    } else {
      // En mode import, vérifier d'abord les données existantes puis les sélections temporaires
      const salleExistante = sallesExistantes.find(s => s.id_salle === salleId);
      let isExistant = false;
      if (salleExistante && salleExistante.disponibilite) {
        const jourData = salleExistante.disponibilite.find(d => d.jour === jour);
        isExistant = jourData ? jourData.creneaux.includes(creneau) : false;
      }
      
      // Vérifier les sélections temporaires
      const salleSelectionnee = sallesSelectionnees.find(s => s.id_salle === salleId);
      let isTemporaire = false;
      if (salleSelectionnee) {
        const jourData = salleSelectionnee.disponibilite.find(d => d.jour === jour);
        isTemporaire = jourData ? jourData.creneaux.includes(creneau) : false;
      }
      
      return isExistant || isTemporaire;
    }
  };

  // Parser les données textuelles
  const parseManualData = () => {
    if (!manualData.trim()) {
      showNotification('Veuillez saisir des données', 'error');
      return;
    }

    try {
      const lines = manualData.trim().split('\n');
      const parsedSalles = [];

      lines.forEach((line, index) => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 2) return;

        const [nomSalle, ...creneauxStr] = parts;
        const salleExistante = sallesExistantes.find(s => 
          s.nom.toLowerCase() === nomSalle.toLowerCase()
        );

        if (!salleExistante) {
          showNotification(`Salle "${nomSalle}" non trouvée`, 'error');
          return;
        }

        const disponibilite = [];
        const creneauxParJour = {};

        creneauxStr.forEach(creneau => {
          const match = creneau.match(/(\w+)\s+(.+)/);
          if (match) {
            const [, jour, horaire] = match;
            if (!creneauxParJour[jour]) {
              creneauxParJour[jour] = [];
            }
            creneauxParJour[jour].push(horaire);
          }
        });

        Object.entries(creneauxParJour).forEach(([jour, creneaux]) => {
          disponibilite.push({ jour, creneaux });
        });

        parsedSalles.push({
          id_salle: salleExistante.id_salle,
          nom: salleExistante.nom,
          disponibilite
        });
      });

      if (parsedSalles.length > 0) {
      setPreview(parsedSalles);
      setShowPreview(true);
        showNotification(`${parsedSalles.length} salle(s) analysée(s) avec succès`, 'success');
      } else {
        showNotification('Aucune donnée valide trouvée', 'error');
      }
    } catch (error) {
      console.error('Erreur parsing:', error);
      showNotification('Erreur lors du parsing des données', 'error');
    }
  };

  // Traiter le fichier uploadé
  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3832/api/salles/preview-file',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setFile(selectedFile);
      setPreview(response.data.salles || []);
      setShowPreview(true);
      showNotification('Fichier traité avec succès', 'success');
    } catch (error) {
      console.error('Erreur traitement fichier:', error);
      showNotification('Erreur lors du traitement du fichier', 'error');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Importer les données
  const importerDonnees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      let dataToImport = [];
      
      if (activeTab === 'manual') {
        dataToImport = sallesSelectionnees;
      } else {
        dataToImport = preview;
      }

      const response = await axios.post(
        'http://localhost:3832/api/salles/update-disponibilites',
        { salles: dataToImport },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setImportedData(dataToImport);
      setShowImportedData(true);
      showNotification('Disponibilités mises à jour avec succès', 'success');
      
      // Recharger les données et reset
      await chargerSallesExistantes();
      if (activeTab === 'manual') {
        setSallesSelectionnees([]);
        setSalleSelectionnee('');
      } else {
        setPreview([]);
        setShowPreview(false);
        setManualData('');
        setFile(null);
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Télécharger template CSV
  const telechargerTemplateCSV = () => {
    const csvContent = `Nom_Salle,Jour_Creneau,Jour_Creneau,...
Salle_101,Lundi 08h30 - 11h30,Mardi 12h00 - 15h00
Salle_Machine_01,Mercredi 15h30 - 18h30,Vendredi 08h30 - 11h30`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_disponibilites.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtenir la salle sélectionnée
  const getSalleSelectionnee = () => {
    return sallesExistantes.find(s => s.id_salle === salleSelectionnee);
  };

  const modeActuelConfig = modes.find(m => m.id === modeActuel);

  // Logique de pagination
  const totalPages = Math.ceil(sallesFiltrees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sallesPaginees = sallesFiltrees.slice(startIndex, endIndex);

  // Fonctions de navigation
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Reset pagination quand on change de recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const tabs = [
    { 
      id: 'manual', 
      label: 'Sélection manuelle', 
      icon: MapPin,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      description: 'Configuration interactive des créneaux'
    },
    { 
      id: 'text', 
      label: 'Copier/Coller', 
      icon: FileText,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      description: 'Import par saisie de texte formaté'
    },
    { 
      id: 'file', 
      label: 'Import fichier', 
      icon: Upload,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      description: 'Upload de fichiers CSV/Excel'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import des Données</h1>
              <p className="text-gray-600 mt-1">Consultez et importez les données de scolarité (salles, créneaux)</p>
            </div>
          </div>

          {/* Modes principaux */}
          <div className="flex gap-4 mb-6">
            {modes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModeActuel(mode.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  modeActuel === mode.id
                    ? `${mode.bgColor} ${mode.borderColor} ${mode.textColor} border-2 shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <span className="text-xl">{mode.icon}</span>
                <span>{mode.title}</span>
                {modeActuel === mode.id && (
                  <motion.div
                    layoutId="activeModeIndicator"
                    className={`w-2 h-2 bg-gradient-to-r ${mode.color} rounded-full`}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Description du mode actif */}
          <div className={`${modeActuelConfig.bgColor} rounded-xl border ${modeActuelConfig.borderColor} p-4 mb-6`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{modeActuelConfig.icon}</span>
              <div>
                <h3 className={`font-semibold ${modeActuelConfig.textColor}`}>
                  Mode {modeActuelConfig.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {modeActuelConfig.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenu selon le mode */}
        <AnimatePresence mode="wait">
          <motion.div
            key={modeActuel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mode Consultation */}
            {modeActuel === 'consulter' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Données Existantes</h3>
                    <p className="text-gray-600">Consultez les disponibilités actuelles des salles</p>
                  </div>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔍 Rechercher une salle
                  </label>
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      placeholder="Rechercher par nom ou ID..."
                    />
                  </div>
                </div>

                {/* Liste des salles avec leurs disponibilités */}
                <div className="space-y-4">
                  {sallesPaginees.map((salle) => (
                    <motion.div
                      key={salle._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-lg">🏢</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-blue-900">{salle.nom}</h4>
                          <p className="text-blue-700 text-sm">
                            {salle.id_salle} • {salle.type} • Capacité: {salle.capacite} places
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {salle.disponibilite?.reduce((total, jour) => total + jour.creneaux.length, 0) || 0} créneaux
                          </span>
                        </div>
                      </div>

                      {/* Grille des disponibilités en lecture seule */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {joursDisponibles.map(jour => (
                          <div key={jour} className="bg-white rounded-lg border border-blue-200 p-4">
                            <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {jour}
                            </h5>
                            <div className="space-y-2">
                              {creneauxDisponibles.map(creneau => {
                                const isAvailable = estCreneauSelectionne(salle.id_salle, jour, creneau);
                                return (
                                  <div
                                    key={creneau}
                                    className={`p-2 rounded-lg text-sm font-medium border ${
                                      isAvailable
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{isAvailable ? '✅' : '❌'}</span>
                                      <span>{creneau}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Contrôles de pagination */}
                {sallesFiltrees.length > itemsPerPage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      ⏮️
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      ⏪
                    </motion.button>
                    <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold">
                      {currentPage} / {totalPages}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      ⏩
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      ⏭️
                    </motion.button>
                  </motion.div>
                )}

                {/* Résumé global */}
                {sallesExistantes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">📈</span>
                      </div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">
                        Résumé Global
                      </h3>
                      <p className="text-blue-700">
                        <strong>{sallesExistantes.length} salles</strong> configurées avec un total de{' '}
                        <strong>
                          {sallesExistantes.reduce((total, salle) => 
                            total + (salle.disponibilite?.reduce((subTotal, jour) => subTotal + jour.creneaux.length, 0) || 0), 0
                          )} créneaux
                        </strong> disponibles
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Mode Import */}
            {modeActuel === 'importer' && (
              <div>
                {/* Navigation par onglets pour l'import */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  activeTab === tab.id
                            ? `${tab.bgColor} border-orange-200 shadow-lg`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    activeTab === tab.id 
                      ? `bg-gradient-to-r ${tab.color}` 
                      : 'bg-gray-100'
                  }`}>
                    <tab.icon className={`w-8 h-8 ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${
                            activeTab === tab.id ? 'text-orange-700' : 'text-gray-700'
                  }`}>
                    {tab.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {tab.description}
                  </p>
                </div>
                
                {activeTab === tab.id && (
                  <motion.div
                            layoutId="activeImportTabIndicator"
                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

                {/* Contenu des onglets d'import */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Sélection manuelle */}
            {activeTab === 'manual' && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Configuration Interactive</h3>
                    <p className="text-gray-600">Sélectionnez une salle et définissez ses créneaux de disponibilité</p>
                  </div>
                </div>
                
                        {/* Sélection de salle */}
                        <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🏢 Sélectionner une salle
                    </label>
                    <select
                      value={salleSelectionnee}
                      onChange={(e) => setSalleSelectionnee(e.target.value)}
                            className="w-full max-w-md px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choisir une salle...</option>
                            {sallesExistantes.map((salle) => (
                        <option key={salle._id} value={salle.id_salle}>
                          {salle.id_salle} - {salle.nom} ({salle.type}, {salle.capacite} places)
                        </option>
                      ))}
                    </select>
                </div>

                        {/* Configuration des créneaux */}
                <AnimatePresence>
                  {salleSelectionnee && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                              className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 p-6 mb-8"
                    >
                      <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">🏢</span>
                        </div>
                        <div>
                                  <h4 className="text-xl font-bold text-orange-900">
                            {getSalleSelectionnee()?.nom}
                          </h4>
                                  <p className="text-orange-700">
                                    Cliquez sur les créneaux pour les activer/désactiver
                          </p>
                        </div>
                      </div>

                      {/* Grille de disponibilité */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {joursDisponibles.map(jour => (
                          <motion.div 
                            key={jour} 
                            whileHover={{ scale: 1.02 }}
                                    className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm"
                          >
                            <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-orange-500" />
                              {jour}
                            </h5>
                            <div className="space-y-3">
                                      {creneauxDisponibles.map(creneau => {
                                        const isSelected = estCreneauSelectionne(salleSelectionnee, jour, creneau);
                                        const salleExistante = sallesExistantes.find(s => s.id_salle === salleSelectionnee);
                                        const isExistant = salleExistante?.disponibilite?.find(d => d.jour === jour)?.creneaux.includes(creneau) || false;
                                        
                                        return (
                                          <label key={creneau} className={`flex items-center cursor-pointer group ${isExistant ? 'opacity-60' : ''}`}>
                                  <input
                                    type="checkbox"
                                              checked={isSelected}
                                    onChange={() => toggleCreneau(salleSelectionnee, jour, creneau)}
                                              disabled={isExistant}
                                              className="mr-3 h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all disabled:opacity-50"
                                            />
                                            <span className={`text-sm transition-colors ${
                                              isExistant 
                                                ? 'text-gray-400 line-through' 
                                                : 'text-gray-700 group-hover:text-orange-600'
                                            }`}>
                                    {creneau}
                                              {isExistant && <span className="ml-2 text-xs text-gray-400">(déjà configuré)</span>}
                                  </span>
                                </label>
                                        );
                                      })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                        {/* Bouton d'import pour sélection manuelle */}
                {sallesSelectionnees.length > 0 && (
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={importerDonnees}
                      disabled={isLoading}
                              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Mise à jour...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Mettre à jour les disponibilités</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* Copier/Coller */}
            {activeTab === 'text' && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Import par Texte</h3>
                    <p className="text-gray-600">Copiez et collez vos données au format spécifié</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl p-6">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                      <span>📋</span> Format attendu :
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <code className="text-sm text-purple-700 font-mono">
                        Nom_Salle, Jour Créneau, Jour Créneau, ...
                      </code>
                      <div className="mt-4 space-y-2">
                        <div className="text-sm text-purple-600">
                          <strong>Exemples :</strong>
                        </div>
                        <div className="bg-purple-50 rounded p-3 font-mono text-sm text-purple-700">
                          Salle_101, Lundi 08h30 - 11h30, Mardi 12h00 - 15h00<br />
                          Salle_Machine_01, Mercredi 15h30 - 18h30
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📝 Données de disponibilité
                    </label>
                    <textarea
                      value={manualData}
                      onChange={(e) => setManualData(e.target.value)}
                      rows="10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all font-mono text-sm"
                      placeholder="Salle_101, Lundi 08h30 - 11h30, Mardi 12h00 - 15h00&#10;Salle_Machine_01, Mercredi 15h30 - 18h30"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={parseManualData}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        <span>Prévisualiser</span>
                      </div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {showPreview && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={importerDonnees}
                          disabled={isLoading}
                                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Save className="w-5 h-5" />
                            )}
                            <span>{isLoading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                          </div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                        {/* Prévisualisation des données */}
                        <AnimatePresence>
                          {showPreview && preview.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl p-6"
                            >
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-purple-800">
                                      Prévisualisation ({preview.length} salle{preview.length > 1 ? 's' : ''})
                                    </h4>
                                    <p className="text-purple-600 text-sm">
                                      Vérifiez les données avant l'import
                                    </p>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setShowPreview(false);
                                    setPreview([]);
                                  }}
                                  className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                                >
                                  ✕
                                </motion.button>
                              </div>

                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {preview.map((salle, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl border border-purple-200 p-4"
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm">🏢</span>
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-purple-900">{salle.nom}</h5>
                                        <p className="text-purple-600 text-sm">{salle.id_salle}</p>
                                      </div>
                                      <div className="ml-auto">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                          {salle.disponibilite?.reduce((total, jour) => total + jour.creneaux.length, 0) || 0} créneaux
                                        </span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {salle.disponibilite?.map((jour, jourIndex) => (
                                        <div key={jourIndex} className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                          <h6 className="font-semibold text-purple-800 mb-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {jour.jour}
                                          </h6>
                                          <div className="space-y-1">
                                            {jour.creneaux.map((creneau, creneauIndex) => (
                                              <div key={creneauIndex} className="text-xs text-purple-700 bg-white rounded px-2 py-1">
                                                {creneau}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
              </div>
            )}

            {/* Import fichier */}
            {activeTab === 'file' && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Import de Fichier</h3>
                    <p className="text-gray-600">Uploadez vos fichiers CSV ou Excel</p>
                  </div>
                </div>

                <div className="space-y-6">
                          <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={telechargerTemplateCSV}
                      className="px-6 py-3 bg-white border-2 border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                                <span>Télécharger Template CSV</span>
                      </div>
                    </motion.button>
                  </div>

                  <div className="border-4 border-dashed border-green-200 rounded-2xl p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    
                    {!file ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Cliquez pour sélectionner un fichier
                        </h4>
                        <p className="text-gray-600">CSV ou Excel (.xlsx, .xls)</p>
                      </motion.div>
                    ) : (
                      <div>
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-green-800 mb-4">{file.name}</h4>
                        <div className="flex justify-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setFile(null);
                              setPreview([]);
                              setShowPreview(false);
                            }}
                            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                          >
                            Changer de fichier
                          </motion.button>
                          <AnimatePresence>
                            {showPreview && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={importerDonnees}
                                disabled={isLoading}
                                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                              >
                                <div className="flex items-center gap-2">
                                  {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Save className="w-5 h-5" />
                                  )}
                                  <span>{isLoading ? 'Mise à jour...' : 'Mettre à jour'}</span>
                                </div>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>

                          {/* Prévisualisation des données de fichier */}
        <AnimatePresence>
          {showPreview && preview.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                      <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                                      <h4 className="text-lg font-bold text-green-800">
                                        Prévisualisation Fichier ({preview.length} salle{preview.length > 1 ? 's' : ''})
                                      </h4>
                                      <p className="text-green-600 text-sm">
                                        Données extraites du fichier {file?.name}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      setShowPreview(false);
                                      setPreview([]);
                                    }}
                  className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  ✕
                </motion.button>
              </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                  {preview.map((salle, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="bg-white rounded-xl border border-green-200 p-4"
                                    >
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                          <span className="text-white text-sm">📁</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-green-900">{salle.nom}</h5>
                                          <p className="text-green-600 text-sm">{salle.id_salle}</p>
                                        </div>
                                        <div className="ml-auto">
                                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            {salle.disponibilite?.reduce((total, jour) => total + jour.creneaux.length, 0) || 0} créneaux
                                          </span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {salle.disponibilite?.map((jour, jourIndex) => (
                                          <div key={jourIndex} className="bg-green-50 rounded-lg p-3 border border-green-100">
                                            <h6 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {jour.jour}
                                            </h6>
                                            <div className="space-y-1">
                                              {jour.creneaux.map((creneau, creneauIndex) => (
                                                <div key={creneauIndex} className="text-xs text-green-700 bg-white rounded px-2 py-1">
                                                  {creneau}
                              </div>
                            ))}
                          </div>
                                          </div>
                    ))}
                                      </div>
                                    </motion.div>
                                  ))}
              </div>
            </motion.div>
          )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImportDonnees;