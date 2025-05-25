import { useState } from 'react';
import { motion } from 'framer-motion';
import DisponibiliteProf from '../../components/admin/emploiDuTemps/DisponibiliteProf';
import ImportDonnees from '../../components/admin/emploiDuTemps/ImportDonnees';
import GenererEmploi from '../../components/admin/emploiDuTemps/GenererEmploi';
import ModificationEDT from '../../components/admin/emploiDuTemps/ModificationEDT';
import CreneauxLibres from '../../components/admin/emploiDuTemps/CreneauxLibres';
import { useNotification } from '../../context/NotificationContext';

const EmploiDuTemps = () => {
  const [activeSection, setActiveSection] = useState('disponibilite');
  const { showNotification } = useNotification();

  const sections = [
    {
      id: 'disponibilite',
      title: '1. Disponibilité',
      fullTitle: 'Gestion de la disponibilité des professeurs',
      description: 'Définir les créneaux horaires disponibles pour chaque professeur',
      features: [
        'Sélection des professeurs',
        'Choix des jours (Lundi au Samedi)',
        'Créneaux : 08h30-11h30, 12h00-15h00, 15h30-18h30'
      ]
    },
    {
      id: 'import',
      title: '2. Import',
      fullTitle: 'Intégration des données de la scolarité',
      description: 'Import des données concernant les salles disponibles',
      features: [
        'Import manuel des données',
        'Upload de fichiers (CSV/Excel)',
        'Conversion automatique des données'
      ]
    },
    {
      id: 'attribution',
      title: '3. Générer l\'emploi du temps',
      fullTitle: 'Génération des emplois du temps',
      description: 'Gestion automatique et manuelle des emplois du temps',
      features: [
        'Génération automatique selon disponibilités',
        'Génération manuelle personnalisée',
        'Vérification des conflits'
      ]
    },
    {
      id: 'modification',
      title: '4. Modification de l\'emploi du temps',
      description: 'Interface de modification des emplois du temps',
      features: [
        'Vue hebdomadaire',
        'Modification par drag-and-drop',
        'Gestion des conflits'
      ]
    },
    {
      id: 'creneaux',
      title: '5. Gestion des créneaux libres',
      description: 'Suivi et réutilisation des créneaux non utilisés',
      features: [
        'Visualisation des créneaux disponibles',
        'Réutilisation des créneaux',
        'Suggestions automatiques'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Emplois du Temps</h1>

      {/* Navigation en onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === section.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de la section active */}
      {sections.map((section) => (
        activeSection === section.id && (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.fullTitle}</h2>
            <p className="text-gray-600 mb-6">{section.description}</p>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Fonctionnalités :</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {section.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              
              {section.id === 'disponibilite' && <DisponibiliteProf />}
              {section.id === 'import' && <ImportDonnees />}
              {section.id === 'attribution' && <GenererEmploi />}
              {section.id === 'modification' && <ModificationEDT />}
              {section.id === 'creneaux' && <CreneauxLibres />}
            </div>
          </motion.div>
        )
      ))}
    </div>
  );
};

export default EmploiDuTemps; 