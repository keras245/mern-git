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
  Filter
} from 'lucide-react';

const ImportDonnees = () => {
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
    setSallesSelectionnees(prev => {
      const salleIndex = prev.findIndex(s => s.id_salle === salleId);
      
      if (salleIndex === -1) {
        // Ajouter la salle avec ce créneau
        return [...prev, {
          id_salle: salleId,
          disponibilite: [{ jour, creneaux: [creneau] }]
        }];
      }

      const salle = { ...prev[salleIndex] };
      const disponibilite = [...salle.disponibilite];
      const jourIndex = disponibilite.findIndex(d => d.jour === jour);

      if (jourIndex === -1) {
        // Ajouter le jour avec le créneau
        disponibilite.push({ jour, creneaux: [creneau] });
      } else {
        // Jour existe, ajouter/retirer le créneau
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

      // Si plus de disponibilité, retirer la salle
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
    const salle = sallesSelectionnees.find(s => s.id_salle === salleId);
    if (!salle) return false;
    
    const jourData = salle.disponibilite.find(d => d.jour === jour);
    return jourData ? jourData.creneaux.includes(creneau) : false;
  };

  // Parser les données textuelles (format: nom_salle, jour créneau, jour créneau...)
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

        // Trouver la salle par son nom
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

      setPreview(parsedSalles);
      setShowPreview(true);
    } catch (error) {
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

      // Utiliser l'endpoint correct pour mettre à jour les disponibilités
      const response = await axios.post(
        'http://localhost:3832/api/salles/update-disponibilites',
        { salles: dataToImport },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setImportedData(dataToImport);
      setShowImportedData(true);
      showNotification('Disponibilités mises à jour avec succès', 'success');
      
      // Reset
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

  // Télécharger template Excel
  const telechargerTemplateExcel = () => {
    const csvContent = `Nom_Salle,Jour_Creneau,Jour_Creneau,...
Salle_101,Lundi 08h30 - 11h30,Mardi 12h00 - 15h00
Salle_Machine_01,Mercredi 15h30 - 18h30,Vendredi 08h30 - 11h30`;
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_disponibilites.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtenir la salle sélectionnée
  const getSalleSelectionnee = () => {
    return sallesExistantes.find(s => s.id_salle === salleSelectionnee);
  };

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
        {/* Navigation par onglets modernes */}
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
                    ? `${tab.bgColor} border-green-200 shadow-lg`
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
                    activeTab === tab.id ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {tab.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {tab.description}
                  </p>
                </div>
                
                {/* Indicateur actif */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Contenu des onglets */}
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
                
                {/* Recherche et sélection de salle */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🔍 Rechercher une salle
                    </label>
                    <div className="relative">
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🏢 Sélectionner une salle
                    </label>
                    <select
                      value={salleSelectionnee}
                      onChange={(e) => setSalleSelectionnee(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choisir une salle...</option>
                      {sallesFiltrees.map((salle) => (
                        <option key={salle._id} value={salle.id_salle}>
                          {salle.id_salle} - {salle.nom} ({salle.type}, {salle.capacite} places)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Configuration des créneaux pour la salle sélectionnée */}
                <AnimatePresence>
                  {salleSelectionnee && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 mb-8"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">🏢</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-blue-900">
                            {getSalleSelectionnee()?.nom}
                          </h4>
                          <p className="text-blue-700">
                            {getSalleSelectionnee()?.id_salle} • {getSalleSelectionnee()?.type} • 
                            Capacité: {getSalleSelectionnee()?.capacite} places
                          </p>
                        </div>
                      </div>

                      {/* Grille de disponibilité */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {joursDisponibles.map(jour => (
                          <motion.div 
                            key={jour} 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm"
                          >
                            <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {jour}
                            </h5>
                            <div className="space-y-3">
                              {creneauxDisponibles.map(creneau => (
                                <label key={creneau} className="flex items-center cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={estCreneauSelectionne(salleSelectionnee, jour, creneau)}
                                    onChange={() => toggleCreneau(salleSelectionnee, jour, creneau)}
                                    className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                                  />
                                  <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                                    {creneau}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Résumé des salles configurées */}
                <AnimatePresence>
                  {sallesSelectionnees.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <span className="text-white">✅</span>
                        </div>
                        <h4 className="text-lg font-bold text-green-800">
                          Salles configurées ({sallesSelectionnees.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sallesSelectionnees.map((salle) => {
                          const salleInfo = sallesExistantes.find(s => s.id_salle === salle.id_salle);
                          return (
                            <div key={salle.id_salle} className="bg-white rounded-lg p-3 border border-green-200">
                              <div className="font-semibold text-green-800">{salleInfo?.nom}</div>
                              <div className="text-sm text-green-600">
                                {salle.disponibilite.length} jour(s) configuré(s)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {sallesSelectionnees.length > 0 && (
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={importerDonnees}
                      disabled={isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={telechargerTemplateCSV}
                      className="px-6 py-3 bg-white border-2 border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        <span>Template CSV</span>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={telechargerTemplateExcel}
                      className="px-6 py-3 bg-white border-2 border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        <span>Template Excel</span>
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
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prévisualisation */}
        <AnimatePresence>
          {showPreview && preview.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mt-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Prévisualisation ({preview.length} salles)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 10).map((salle, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{salle.nom || salle.id_salle}</div>
                          {salle.nom && <div className="text-sm text-gray-500">{salle.id_salle}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            {salle.disponibilite?.map((disp, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="font-medium text-blue-600 min-w-[80px]">{disp.jour}:</span> 
                                <span className="text-gray-700">{disp.creneaux.join(', ')}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div className="text-center py-4">
                    <span className="text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                      ... et {preview.length - 10} autres salles
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Données importées */}
        <AnimatePresence>
          {showImportedData && importedData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">
                      Import réussi ! 🎉
                    </h3>
                    <p className="text-green-600">
                      {importedData.length} salles mises à jour avec succès
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowImportedData(false)}
                  className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  ✕
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-green-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Salle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Disponibilité mise à jour</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-200">
                    {importedData.map((salle, index) => (
                      <tr key={index} className="hover:bg-green-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-green-800">{salle.nom || salle.id_salle}</div>
                          {salle.nom && <div className="text-sm text-green-600">{salle.id_salle}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            {salle.disponibilite?.map((disp, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="font-medium text-green-700 min-w-[80px]">{disp.jour}:</span> 
                                <span className="text-green-600">{disp.creneaux.join(', ')}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImportDonnees;