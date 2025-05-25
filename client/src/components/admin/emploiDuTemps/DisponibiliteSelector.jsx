import { useState, useEffect } from 'react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CRENEAUX = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

const DisponibiliteSelector = ({ value = [], onChange }) => {
  const [disponibilites, setDisponibilites] = useState(
    JOURS.map(jour => ({
      jour,
      creneaux: []
    }))
  );

  useEffect(() => {
    if (value.length > 0) {
      setDisponibilites(
        JOURS.map(jour => {
          const jourDispos = value.find(d => d.jour === jour);
          return {
            jour,
            creneaux: jourDispos ? jourDispos.creneaux : []
          };
        })
      );
    }
  }, [value]);

  const handleCreneauToggle = (jour, creneau) => {
    const newDisponibilites = disponibilites.map(d => {
      if (d.jour === jour) {
        const creneaux = d.creneaux.includes(creneau)
          ? d.creneaux.filter(c => c !== creneau)
          : [...d.creneaux, creneau];
        return { ...d, creneaux };
      }
      return d;
    });
    
    setDisponibilites(newDisponibilites);
    onChange(newDisponibilites.filter(d => d.creneaux.length > 0));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {JOURS.map(jour => (
          <div key={jour} className="border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="font-medium text-gray-700 mb-3">{jour}</h4>
            <div className="flex flex-wrap gap-2">
              {CRENEAUX.map(creneau => {
                const isSelected = disponibilites
                  .find(d => d.jour === jour)?.creneaux
                  .includes(creneau);
                
                return (
                  <button
                    key={creneau}
                    type="button"
                    onClick={() => handleCreneauToggle(jour, creneau)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isSelected 
                        ? 'bg-primary-100 text-primary-800 hover:bg-primary-200 border-2 border-primary-500' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'}`}
                  >
                    {creneau}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisponibiliteSelector; 