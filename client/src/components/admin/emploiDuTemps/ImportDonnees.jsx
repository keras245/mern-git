import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
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

      setPreview(response.data.salles);
      setShowPreview(true);
      setFile(selectedFile);
    } catch (error) {
      showNotification('Erreur lors de la lecture du fichier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Importer les données (mettre à jour les disponibilités)
  const importerDonnees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      let dataToImport = [];
      
      if (activeTab === 'manual') {
        dataToImport = sallesSelectionnees;
      } else if (activeTab === 'text') {
        dataToImport = preview;
      } else {
        // Import fichier
        dataToImport = preview;
      }

      console.log('Données à importer:', dataToImport); // Debug

      // Mettre à jour les disponibilités des salles
      const response = await axios.post(
        'http://localhost:3832/api/salles/update-disponibilites',
        { salles: dataToImport },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('Réponse serveur:', response.data); // Debug

      showNotification('Disponibilités mises à jour avec succès', 'success');
      
      // Stocker les données importées pour visualisation
      const sallesImportees = response.data.salles || dataToImport;
      console.log('Salles importées pour visualisation:', sallesImportees); // Debug
      
      setImportedData(sallesImportees);
      setShowImportedData(true);
      
      // Reset
      setSallesSelectionnees([]);
      setManualData('');
      setPreview([]);
      setShowPreview(false);
      setFile(null);
      setSalleSelectionnee('');
      
    } catch (error) {
      console.error('Erreur import:', error);
      showNotification('Erreur lors de l\'import', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Télécharger le template CSV
  const telechargerTemplateCSV = () => {
    const csvContent = `nom_salle,disponibilite
Salle_101,"[{""jour"":""Lundi"",""creneaux"":[""08h30 - 11h30"",""12h00 - 15h00""]}]"
Salle_Machine_01,"[{""jour"":""Mardi"",""creneaux"":[""15h30 - 18h30""]}]"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_disponibilites_salles.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Télécharger le template Excel
  const telechargerTemplateExcel = () => {
    const excelContent = `nom_salle\tdisponibilite
Salle_101\t"[{""jour"":""Lundi"",""creneaux"":[""08h30 - 11h30"",""12h00 - 15h00""]}]"
Salle_Machine_01\t"[{""jour"":""Mardi"",""creneaux"":[""15h30 - 18h30""]}]"`;
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_disponibilites_salles.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtenir la salle sélectionnée
  const getSalleSelectionnee = () => {
    return sallesExistantes.find(s => s.id_salle === salleSelectionnee);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Import des créneaux de disponibilité
        </h2>
        <p className="text-gray-600">
          Définissez les créneaux de disponibilité pour les salles existantes
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'manual', label: 'Sélection manuelle', icon: MapPin },
              { id: 'text', label: 'Copier/Coller', icon: FileText },
              { id: 'file', label: 'Import fichier', icon: Upload }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Sélection manuelle */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Sélectionner une salle et ses créneaux</h3>
                
                {/* Recherche et sélection de salle */}
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rechercher une salle
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Rechercher par nom ou ID..."
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner une salle
                      </label>
                      <select
                        value={salleSelectionnee}
                        onChange={(e) => setSalleSelectionnee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
                </div>

                {/* Configuration des créneaux pour la salle sélectionnée */}
                {salleSelectionnee && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-medium text-lg text-gray-800">
                        Configuration pour {getSalleSelectionnee()?.nom}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getSalleSelectionnee()?.id_salle} • {getSalleSelectionnee()?.type} • 
                        Capacité: {getSalleSelectionnee()?.capacite} places
                      </p>
                    </div>

                    {/* Grille de disponibilité */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {joursDisponibles.map(jour => (
                        <div key={jour} className="border rounded-lg p-3 bg-white">
                          <h5 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {jour}
                          </h5>
                          <div className="space-y-2">
                            {creneauxDisponibles.map(creneau => (
                              <label key={creneau} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={estCreneauSelectionne(salleSelectionnee, jour, creneau)}
                                  onChange={() => toggleCreneau(salleSelectionnee, jour, creneau)}
                                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{creneau}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Résumé des salles configurées */}
              {sallesSelectionnees.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Salles configurées ({sallesSelectionnees.length})
                  </h4>
                  <div className="space-y-2">
                    {sallesSelectionnees.map((salle) => {
                      const salleInfo = sallesExistantes.find(s => s.id_salle === salle.id_salle);
                      return (
                        <div key={salle.id_salle} className="text-sm text-blue-700">
                          <strong>{salleInfo?.nom}</strong> - {salle.disponibilite.length} jour(s) configuré(s)
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sallesSelectionnees.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={importerDonnees}
                    disabled={isLoading}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Mise à jour...' : 'Mettre à jour les disponibilités'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Copier/Coller */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Données de disponibilité
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Format attendu :</h4>
                  <code className="text-sm text-blue-700">
                    Nom_Salle, Jour Créneau, Jour Créneau, ...
                  </code>
                  <div className="mt-2 text-sm text-blue-600">
                    <strong>Exemple :</strong><br />
                    Salle_101, Lundi 08h30 - 11h30, Mardi 12h00 - 15h00<br />
                    Salle_Machine_01, Mercredi 15h30 - 18h30
                  </div>
                </div>
                <textarea
                  value={manualData}
                  onChange={(e) => setManualData(e.target.value)}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Salle_101, Lundi 08h30 - 11h30, Mardi 12h00 - 15h00&#10;Salle_Machine_01, Mercredi 15h30 - 18h30"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={parseManualData}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Prévisualiser
                </button>
                
                {showPreview && (
                  <button
                    onClick={importerDonnees}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Import fichier */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Import depuis un fichier</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={telechargerTemplateCSV}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Template CSV
                  </button>
                  <button
                    onClick={telechargerTemplateExcel}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Template Excel
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                
                {!file ? (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Cliquez pour sélectionner un fichier
                    </button>
                    <p className="text-gray-500 mt-2">CSV ou Excel (.xlsx, .xls)</p>
                  </div>
                ) : (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="font-medium">{file.name}</p>
                    <div className="flex justify-center space-x-3 mt-4">
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreview([]);
                          setShowPreview(false);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Changer de fichier
                      </button>
                      {showPreview && (
                        <button
                          onClick={importerDonnees}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prévisualisation */}
      {showPreview && preview.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium mb-4">Prévisualisation ({preview.length} salles)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(0, 10).map((salle, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{salle.nom || salle.id_salle}</div>
                      {salle.nom && <div className="text-sm text-gray-500">{salle.id_salle}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {salle.disponibilite?.map((disp, i) => (
                          <div key={i} className="mb-1">
                            <span className="font-medium text-blue-600">{disp.jour}:</span> 
                            <span className="ml-2">{disp.creneaux.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-center text-gray-500 mt-4">
                ... et {preview.length - 10} autres salles
              </p>
            )}
          </div>
        </div>
      )}

      {/* Données importées */}
      {showImportedData && importedData.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-green-800">
              Import réussi ! ({importedData.length} salles mises à jour)
            </h3>
            <button
              onClick={() => setShowImportedData(false)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Salle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Disponibilité mise à jour</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-200">
                {importedData.map((salle, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-green-800">{salle.nom || salle.id_salle}</div>
                      {salle.nom && <div className="text-sm text-green-600">{salle.id_salle}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {salle.disponibilite?.map((disp, i) => (
                          <div key={i} className="mb-1">
                            <span className="font-medium text-green-700">{disp.jour}:</span> 
                            <span className="ml-2 text-green-600">{disp.creneaux.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportDonnees; 