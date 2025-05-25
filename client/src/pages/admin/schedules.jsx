import { useState } from 'react';

const EmploiDuTemps = () => {
  const [activeSection, setActiveSection] = useState('disponibilite');

  const sections = [
    {
      id: 'disponibilite',
      title: '1. Gestion de la disponibilité des professeurs',
      description: 'Définir les créneaux horaires disponibles pour chaque professeur',
      features: [
        'Sélection des professeurs',
        'Choix des jours (Lundi au Samedi)',
        'Créneaux : 08h30-11h30, 12h00-15h00, 15h30-18h30'
      ]
    },
    {
      id: 'import',
      title: '2. Intégration des données de la scolarité',
      description: 'Import des données concernant les salles disponibles',
      features: [
        'Import manuel des données',
        'Upload de fichiers (CSV/Excel)',
        'Conversion automatique des données'
      ]
    },
    {
      id: 'attribution',
      title: '3. Attribution des cours',
      description: 'Gestion automatique et manuelle des attributions',
      features: [
        'Attribution automatique selon disponibilités',
        'Attribution manuelle personnalisée',
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Emplois du Temps</h1>
      
      <div className="grid gap-6">
        {sections.map((section) => (
          <div 
            key={section.id}
            className={`p-6 rounded-lg border ${
              activeSection === section.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            } cursor-pointer transition-all`}
            onClick={() => setActiveSection(section.id)}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {section.title}
            </h2>
            <p className="text-gray-600 mb-4">{section.description}</p>
            
            {activeSection === section.id && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-gray-700">Fonctionnalités :</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {section.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                
                {section.id === 'disponibilite' && (
                  <div className="mt-6 p-4 bg-white rounded border border-gray-200">
                    {/* Ici on mettra le composant de gestion des disponibilités */}
                    <p className="text-gray-500 italic">Fonctionnalité en cours d'implémentation...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmploiDuTemps; 