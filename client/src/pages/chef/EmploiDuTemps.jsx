import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Download,
  Filter,
  Search,
  Eye,
  RefreshCw,
  BookOpen,
  Users,
  Monitor,
  Laptop,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';

const EmploiDuTemps = () => {
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semaine, setSemaine] = useState(getCurrentWeek());
  const [filtreJour, setFiltreJour] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [programme, setProgramme] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  useEffect(() => {
    chargerEmploiDuTemps();
  }, []);

  function getCurrentWeek() {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return firstDayOfWeek;
  }

  // Fonction pour parser la classe du chef et extraire les composants
  const parseClasseChef = (classeString) => {
    if (!classeString) return null;
    
    console.log('Analyse de la classe:', classeString);
    
    // Format attendu: "Génie Civil - L4 S7 G1"
    // Regex pour extraire les parties
    const regex = /^(.+?)\s*-\s*L(\d+)\s*S(\d+)\s*G(\d+)$/;
    const match = classeString.match(regex);
    
    if (match) {
      return {
        nom: match[1].trim(),
        licence: parseInt(match[2]),
        semestre: parseInt(match[3]),
        groupe: parseInt(match[4])
      };
    }
    
    console.log('Format de classe non reconnu:', classeString);
    return null;
  };

  // Fonction pour trouver le programme correspondant
  const trouverProgrammeCorrespondant = (programmes, classeInfo) => {
    if (!classeInfo || !programmes) return null;
    
    console.log('Recherche du programme pour:', classeInfo);
    console.log('Programmes disponibles:', programmes);
    
    const programme = programmes.find(p => 
      p.nom === classeInfo.nom &&
      p.licence === classeInfo.licence &&
      p.semestre === classeInfo.semestre &&
      p.groupe >= classeInfo.groupe // Le programme doit avoir au moins ce nombre de groupes
    );
    
    console.log('Programme trouvé:', programme);
    return programme;
  };

  const chargerEmploiDuTemps = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user.classe) {
        setError('Votre classe n\'est pas définie. Contactez l\'administration.');
        setEmploiDuTemps(null);
        return;
      }

      console.log('Classe du chef:', user.classe);

      // 1. Parser la classe du chef
      const classeInfo = parseClasseChef(user.classe);
      if (!classeInfo) {
        setError(`Format de classe invalide: "${user.classe}". Format attendu: "Programme - L# S# G#"`);
        setEmploiDuTemps(null);
        return;
      }

      // 2. Récupérer tous les programmes
      const programmesResponse = await api.get('/programmes');
      console.log('Programmes récupérés:', programmesResponse.data);

      // 3. Trouver le programme correspondant
      const programmeCorrespondant = trouverProgrammeCorrespondant(programmesResponse.data, classeInfo);

      if (!programmeCorrespondant) {
        setError(`Aucun programme trouvé pour "${classeInfo.nom}" niveau L${classeInfo.licence} S${classeInfo.semestre}. Contactez l'administration pour vérifier la configuration de votre classe.`);
        setEmploiDuTemps(null);
        return;
      }

      console.log('Programme correspondant trouvé:', programmeCorrespondant);
      setProgramme(programmeCorrespondant);

      // 4. Récupérer l'emploi du temps pour ce programme et ce groupe
      try {
        const emploiResponse = await api.get(`/emplois/${programmeCorrespondant._id}/${classeInfo.groupe}`);
        console.log('Réponse emploi du temps:', emploiResponse.data);
        
        if (emploiResponse.data && emploiResponse.data.seances && emploiResponse.data.seances.length > 0) {
          // Les données sont déjà populées côté backend
          setEmploiDuTemps({
            programme: programmeCorrespondant.nom,
            classe: user.classe,
            licence: programmeCorrespondant.licence,
            semestre: programmeCorrespondant.semestre,
            groupe: classeInfo.groupe,
            seances: emploiResponse.data.seances.map(seance => ({
              ...seance,
              matiere: seance.cours?.nom_matiere || 'Matière inconnue',
              professeur: `${seance.professeur?.prenom || ''} ${seance.professeur?.nom || ''}`.trim() || 'Professeur inconnu',
              salle: seance.salle?.nom || 'Salle inconnue',
              type: seance.cours?.type || 'Cours',
              couleur: getCouleurMatiere(seance.cours?.nom_matiere || 'inconnue')
            }))
          });
          setError('');
        } else {
          setError(`Aucun emploi du temps généré pour votre classe (${user.classe}). L'administration doit d'abord créer votre emploi du temps.`);
          setEmploiDuTemps(null);
        }
      } catch (error) {
        console.error('Erreur récupération emploi:', error);
        if (error.response?.status === 404) {
          setError(`Aucun emploi du temps généré pour votre classe (${user.classe}). L'administration doit d'abord créer votre emploi du temps.`);
        } else {
          setError('Erreur lors de la récupération de l\'emploi du temps. Veuillez réessayer.');
        }
        setEmploiDuTemps(null);
      }
      
    } catch (error) {
      console.error('Erreur chargement emploi du temps:', error);
      setError('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
      setEmploiDuTemps(null);
    } finally {
      setLoading(false);
    }
  };

  const getCouleurMatiere = (matiere) => {
    const couleurs = {
      'mathématiques': 'bg-blue-500',
      'physique': 'bg-green-500',
      'informatique': 'bg-purple-500',
      'anglais': 'bg-orange-500',
      'base de données': 'bg-red-500',
      'réseaux': 'bg-indigo-500',
      'génie logiciel': 'bg-pink-500',
      'projet': 'bg-teal-500',
      'algorithme': 'bg-yellow-500',
      'système': 'bg-gray-600',
      'civil': 'bg-amber-600',
      'construction': 'bg-stone-600',
      'béton': 'bg-gray-700',
      'structure': 'bg-zinc-600'
    };

    const matiereKey = matiere.toLowerCase();
    for (const [key, couleur] of Object.entries(couleurs)) {
      if (matiereKey.includes(key)) {
        return couleur;
      }
    }
    return 'bg-gray-500';
  };

  const getSeanceForSlot = (jour, creneau) => {
    if (!emploiDuTemps) return null;
    return emploiDuTemps.seances.find(s => s.jour === jour && s.creneau === creneau);
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'cours':
        return <BookOpen className="w-4 h-4" />;
      case 'td':
        return <Users className="w-4 h-4" />;
      case 'tp':
        return <Laptop className="w-4 h-4" />;
      case 'projet':
        return <Monitor className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const exporterPDF = async () => {
    try {
      if (!emploiDuTemps || !programme) {
        alert('Aucun emploi du temps à exporter');
        return;
      }
      
      // Appeler l'API d'export PDF avec les bons paramètres
      const response = await api.post('/emplois/exporter/pdf', {
        programmeId: programme._id,
        groupe: emploiDuTemps.groupe
      }, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi-du-temps-${user.classe.replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    }
  };

  const filteredJours = filtreJour === 'tous' ? jours : [filtreJour];
  
  // Filtrer les séances selon le terme de recherche
  const seancesFiltrees = emploiDuTemps?.seances.filter(seance =>
    seance.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seance.professeur.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement de votre emploi du temps...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Emploi du temps - {user.classe}
            </h1>
            <p className="text-gray-600">
              {emploiDuTemps ? 
                `${emploiDuTemps.programme} - Licence ${emploiDuTemps.licence} - Semestre ${emploiDuTemps.semestre} - Groupe ${emploiDuTemps.groupe}` :
                programme ? `${programme.nom} - L${programme.licence} S${programme.semestre}` : 'Programme non défini'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Semaine du {semaine.toLocaleDateString('fr-FR')}
            </p>
            {emploiDuTemps && (
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">Emploi du temps à jour</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={chargerEmploiDuTemps}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            
            {emploiDuTemps && (
            <button
              onClick={exporterPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter PDF</span>
            </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Message d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Emploi du temps non disponible
              </h3>
              <p className="text-red-700 mb-3">{error}</p>
              <div className="text-sm text-red-600 bg-red-100 rounded-lg p-3 mb-3">
                <strong>Informations de débogage :</strong><br />
                Classe enregistrée : <code>{user.classe}</code><br />
                Format attendu : <code>Programme - L# S# G#</code>
              </div>
              <button
                onClick={chargerEmploiDuTemps}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {emploiDuTemps && (
        <>
      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filtreJour}
                onChange={(e) => setFiltreJour(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="tous">Tous les jours</option>
                {jours.map(jour => (
                  <option key={jour} value={jour}>{jour}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
                  placeholder="Rechercher une matière ou un professeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </motion.div>

          {/* Grille de l'emploi du temps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Planning hebdomadaire</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700 border-b border-gray-200">
                        Créneaux
                      </th>
                      {filteredJours.map(jour => (
                        <th key={jour} className="text-center p-4 font-semibold text-gray-700 border-b border-gray-200 min-w-[200px]">
                          {jour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {creneaux.map((creneau, creneauIndex) => (
                      <tr key={creneau} className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-600 bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{creneau}</span>
                          </div>
                        </td>
                        {filteredJours.map(jour => {
                          const seance = getSeanceForSlot(jour, creneau);
                          
                          // Filtrer selon le terme de recherche
                          if (searchTerm && seance && 
                              !seance.matiere.toLowerCase().includes(searchTerm.toLowerCase()) &&
                              !seance.professeur.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return (
                              <td key={`${jour}-${creneau}`} className="p-2">
                                <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                  <span className="text-xs">Filtré</span>
                                </div>
                              </td>
                            );
                          }
                          
                          return (
                            <td key={`${jour}-${creneau}`} className="p-2">
                              {seance ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: creneauIndex * 0.1 }}
                                  className={`${seance.couleur} text-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-sm">{seance.matiere}</h4>
                                    <div className="flex items-center space-x-1">
                                      {getTypeIcon(seance.type)}
                                      <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1 text-xs opacity-90">
                                    <div className="flex items-center space-x-1">
                                      <User className="w-3 h-3" />
                                      <span>{seance.professeur}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>Salle {seance.salle}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-medium">
                                      {seance.type}
                                    </span>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                  <span className="text-xs">Libre</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total cours</p>
                  <p className="text-2xl font-bold text-gray-900">{emploiDuTemps?.seances.length || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Heures/semaine</p>
                  <p className="text-2xl font-bold text-gray-900">{(emploiDuTemps?.seances.length || 0) * 3}h</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Professeurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(emploiDuTemps?.seances.map(s => s.professeur) || []).size}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Salles utilisées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(emploiDuTemps?.seances.map(s => s.salle) || []).size}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default EmploiDuTemps; 