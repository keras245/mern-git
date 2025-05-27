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
  Laptop
} from 'lucide-react';
import api from '../../services/api';

const EmploiDuTemps = () => {
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const chargerEmploiDuTemps = async () => {
    try {
      setLoading(true);
      
      // 1. D'abord, récupérer le programme correspondant à la classe du chef
      const programmesResponse = await api.get('/programmes');
      const programmeCorrespondant = programmesResponse.data.find(p => 
        p.nom.toLowerCase().includes(user.classe?.toLowerCase()) || 
        p.nom === user.classe
      );

      if (!programmeCorrespondant) {
        console.log('Aucun programme trouvé pour la classe:', user.classe);
        // Utiliser des données simulées si aucun programme trouvé
        setEmploiDuTemps(getEmploiSimule());
        return;
      }

      setProgramme(programmeCorrespondant);

      // 2. Récupérer l'emploi du temps pour ce programme
      try {
        const emploiResponse = await api.get(`/emplois/programme/${programmeCorrespondant._id}/groupe/1`);
        
        if (emploiResponse.data && emploiResponse.data.seances) {
          // Enrichir les données avec les informations des cours, professeurs et salles
          const seancesEnrichies = await Promise.all(
            emploiResponse.data.seances.map(async (seance) => {
              try {
                const [coursResponse, profResponse, salleResponse] = await Promise.all([
                  api.get(`/cours/${seance.cours}`),
                  api.get(`/professeurs/${seance.professeur}`),
                  api.get(`/salles/${seance.salle}`)
                ]);

                return {
                  ...seance,
                  matiere: coursResponse.data.nom_matiere,
                  professeur: `${profResponse.data.prenom} ${profResponse.data.nom}`,
                  salle: salleResponse.data.nom,
                  type: coursResponse.data.type || 'Cours',
                  couleur: getCouleurMatiere(coursResponse.data.nom_matiere)
                };
              } catch (error) {
                console.error('Erreur enrichissement séance:', error);
                return {
                  ...seance,
                  matiere: 'Matière inconnue',
                  professeur: 'Professeur inconnu',
                  salle: 'Salle inconnue',
                  type: 'Cours',
                  couleur: 'bg-gray-500'
                };
              }
            })
          );

          setEmploiDuTemps({
            programme: programmeCorrespondant.nom,
            classe: user.classe,
            seances: seancesEnrichies
          });
        } else {
          // Aucun emploi du temps trouvé, utiliser des données simulées
          setEmploiDuTemps(getEmploiSimule());
        }
      } catch (error) {
        console.log('Aucun emploi du temps trouvé pour ce programme, utilisation de données simulées');
        setEmploiDuTemps(getEmploiSimule());
      }
      
    } catch (error) {
      console.error('Erreur chargement emploi du temps:', error);
      // En cas d'erreur, utiliser des données simulées
      setEmploiDuTemps(getEmploiSimule());
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
      'système': 'bg-gray-500'
    };

    const matiereKey = matiere.toLowerCase();
    for (const [key, couleur] of Object.entries(couleurs)) {
      if (matiereKey.includes(key)) {
        return couleur;
      }
    }
    return 'bg-gray-500';
  };

  const getEmploiSimule = () => {
    return {
      programme: user.classe || 'Programme non défini',
      classe: user.classe,
      seances: [
        {
          id: 1,
          jour: 'Lundi',
          creneau: '08h30 - 11h30',
          matiere: 'Mathématiques',
          professeur: 'Dr. Diallo',
          salle: 'A101',
          type: 'Cours',
          couleur: 'bg-blue-500'
        },
        {
          id: 2,
          jour: 'Lundi',
          creneau: '12h00 - 15h00',
          matiere: 'Physique',
          professeur: 'Prof. Camara',
          salle: 'B205',
          type: 'TD',
          couleur: 'bg-green-500'
        },
        {
          id: 3,
          jour: 'Mardi',
          creneau: '08h30 - 11h30',
          matiere: 'Informatique',
          professeur: 'Dr. Touré',
          salle: 'C301',
          type: 'TP',
          couleur: 'bg-purple-500'
        },
        {
          id: 4,
          jour: 'Mardi',
          creneau: '15h30 - 18h30',
          matiere: 'Anglais',
          professeur: 'Mme. Barry',
          salle: 'A203',
          type: 'Cours',
          couleur: 'bg-orange-500'
        },
        {
          id: 5,
          jour: 'Mercredi',
          creneau: '12h00 - 15h00',
          matiere: 'Base de données',
          professeur: 'Dr. Konaté',
          salle: 'C102',
          type: 'TP',
          couleur: 'bg-red-500'
        },
        {
          id: 6,
          jour: 'Jeudi',
          creneau: '08h30 - 11h30',
          matiere: 'Réseaux',
          professeur: 'Prof. Sylla',
          salle: 'C201',
          type: 'Cours',
          couleur: 'bg-indigo-500'
        },
        {
          id: 7,
          jour: 'Vendredi',
          creneau: '12h00 - 15h00',
          matiere: 'Génie Logiciel',
          professeur: 'Dr. Bah',
          salle: 'A105',
          type: 'TD',
          couleur: 'bg-pink-500'
        },
        {
          id: 8,
          jour: 'Samedi',
          creneau: '08h30 - 11h30',
          matiere: 'Projet',
          professeur: 'Dr. Touré',
          salle: 'C301',
          type: 'Projet',
          couleur: 'bg-teal-500'
        }
      ]
    };
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
      if (!emploiDuTemps) return;
      
      // Appeler l'API d'export PDF
      const response = await api.get(`/emplois/export-pdf/${programme?._id}/1`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi-du-temps-${user.classe}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
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
              {emploiDuTemps?.programme || 'Programme non défini'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Semaine du {semaine.toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={chargerEmploiDuTemps}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={exporterPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter PDF</span>
            </button>
          </div>
        </div>
      </motion.div>

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
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </motion.div>

      {/* Message si aucun emploi du temps */}
      {!emploiDuTemps || emploiDuTemps.seances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
        >
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun emploi du temps disponible
          </h3>
          <p className="text-gray-600 mb-6">
            L'emploi du temps pour votre classe n'a pas encore été généré par l'administration.
          </p>
          <button
            onClick={chargerEmploiDuTemps}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Vérifier à nouveau
          </button>
        </motion.div>
      ) : (
        <>
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