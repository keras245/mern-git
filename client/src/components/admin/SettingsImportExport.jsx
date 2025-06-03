import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, FileText, AlertTriangle, Check } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import settingsService from '../../services/settingsService';

export default function SettingsImportExport({ onImportComplete }) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { showNotification } = useNotification();

  const handleExport = async () => {
    try {
      setExporting(true);
      await settingsService.exportSettings();
      showNotification('Paramètres exportés avec succès', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      showNotification('Erreur lors de l\'export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const settingsData = JSON.parse(e.target.result);
          
          // Valider le format du fichier
          if (!settingsData.settings) {
            throw new Error('Format de fichier invalide');
          }
          
          await settingsService.importSettings(settingsData.settings);
          showNotification('Paramètres importés avec succès', 'success');
          
          if (onImportComplete) {
            onImportComplete();
          }
        } catch (parseError) {
          console.error('Erreur parsing:', parseError);
          showNotification('Fichier invalide ou corrompu', 'error');
        } finally {
          setImporting(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Erreur import:', error);
      showNotification('Erreur lors de l\'import', 'error');
      setImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="text-blue-600" size={24} />
        <h3 className="text-xl font-bold text-gray-900">Import / Export</h3>
      </div>

      <div className="space-y-6">
        {/* Avertissement */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-yellow-800">Important</h4>
              <p className="text-sm text-yellow-700 mt-1">
                L'import remplacera vos paramètres actuels. Assurez-vous d'exporter vos paramètres actuels avant d'importer de nouveaux paramètres.
              </p>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Exporter les paramètres</h4>
          <p className="text-sm text-gray-600">
            Télécharger vos paramètres actuels dans un fichier JSON
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download size={16} className="mr-2" />
            )}
            {exporting ? 'Export en cours...' : 'Exporter'}
          </button>
        </div>

        {/* Import */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Importer les paramètres</h4>
          <p className="text-sm text-gray-600">
            Charger des paramètres depuis un fichier JSON exporté
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              id="settings-import"
            />
            <label
              htmlFor="settings-import"
              className={`flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors ${
                importing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {importing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              ) : (
                <Upload size={16} className="mr-2 text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {importing ? 'Import en cours...' : 'Cliquer pour sélectionner un fichier'}
              </span>
            </label>
          </div>
        </div>

        {/* Informations */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Que contient l'export ?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center">
              <Check size={14} className="text-green-600 mr-2" />
              Paramètres généraux (langue, fuseau horaire, etc.)
            </li>
            <li className="flex items-center">
              <Check size={14} className="text-green-600 mr-2" />
              Préférences de notifications
            </li>
            <li className="flex items-center">
              <Check size={14} className="text-green-600 mr-2" />
              Paramètres d'apparence
            </li>
            <li className="flex items-center">
              <Check size={14} className="text-green-600 mr-2" />
              Préférences de profil
            </li>
            <li className="flex items-center text-red-600">
              <AlertTriangle size={14} className="mr-2" />
              Exclut les mots de passe et données sensibles
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
} 