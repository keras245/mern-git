import { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { Upload } from 'lucide-react';

const ImportDonnees = () => {
  const [importMethod, setImportMethod] = useState('manual');
  const [manualData, setManualData] = useState('');
  const [file, setFile] = useState(null);
  const { showNotification } = useNotification();

  const handleManualImport = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = manualData.split('\n').map(line => {
        const [nom, ...creneaux] = line.split(',').map(s => s.trim());
        return { nom, creneaux };
      });

      await axios.post(
        'http://localhost:3832/api/salles/import-manual',
        { salles: data },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      showNotification('Données importées avec succès', 'success');
      setManualData('');
    } catch (error) {
      showNotification('Erreur lors de l\'import des données', 'error');
    }
  };

  const handleFileImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3832/api/salles/import-file',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      showNotification('Fichier importé avec succès', 'success');
      setFile(null);
    } catch (error) {
      showNotification('Erreur lors de l\'import du fichier', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setImportMethod('manual')}
          className={`py-2 px-4 ${importMethod === 'manual' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
        >
          Import Manuel
        </button>
        <button
          onClick={() => setImportMethod('file')}
          className={`py-2 px-4 ${importMethod === 'file' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
        >
          Import Fichier
        </button>
      </div>

      {importMethod === 'manual' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Données des salles
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Format: Nom_Salle, Créneau1, Créneau2, ...
              <br />
              Exemple: Salle_101, Lundi 08h30 - 11h30, Mardi 12h00 - 15h00
            </p>
            <textarea
              value={manualData}
              onChange={(e) => setManualData(e.target.value)}
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Salle_101, Lundi 08h30 - 11h30, Mardi 12h00 - 15h00&#10;Salle_102, Mercredi 15h30 - 18h30, Jeudi 08h30 - 11h30"
            />
          </div>
          <button
            onClick={handleManualImport}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Importer les données
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <span className="text-gray-600">
                {file ? file.name : "Cliquez pour sélectionner un fichier CSV ou Excel"}
              </span>
            </label>
          </div>
          {file && (
            <button
              onClick={handleFileImport}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Importer le fichier
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportDonnees; 