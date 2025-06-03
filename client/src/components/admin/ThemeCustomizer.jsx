import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Eye, 
  Save, 
  RefreshCw,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';

export default function ThemeCustomizer({ currentTheme, onThemeChange, onSave }) {
  const [customTheme, setCustomTheme] = useState({
    primary: currentTheme.primaryColor || '#3B82F6',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const colorPalettes = [
    {
      name: 'Océan',
      colors: { primary: '#0EA5E9', secondary: '#0284C7', accent: '#06B6D4' }
    },
    {
      name: 'Forêt',
      colors: { primary: '#059669', secondary: '#047857', accent: '#10B981' }
    },
    {
      name: 'Coucher de soleil',
      colors: { primary: '#EA580C', secondary: '#DC2626', accent: '#F59E0B' }
    },
    {
      name: 'Violet',
      colors: { primary: '#7C3AED', secondary: '#6D28D9', accent: '#8B5CF6' }
    },
    {
      name: 'Rose',
      colors: { primary: '#DB2777', secondary: '#BE185D', accent: '#EC4899' }
    },
    {
      name: 'Nuit',
      colors: { primary: '#1F2937', secondary: '#374151', accent: '#6B7280' }
    }
  ];

  const handleColorChange = (colorType, value) => {
    const newTheme = { ...customTheme, [colorType]: value };
    setCustomTheme(newTheme);
    
    if (previewMode) {
      onThemeChange(newTheme);
    }
  };

  const applyPalette = (palette) => {
    const newTheme = { ...customTheme, ...palette.colors };
    setCustomTheme(newTheme);
    
    if (previewMode) {
      onThemeChange(newTheme);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      onThemeChange(customTheme);
    } else {
      // Remettre le thème original
      onThemeChange({ primaryColor: currentTheme.primaryColor });
    }
  };

  const saveTheme = () => {
    onSave(customTheme);
    setPreviewMode(false);
  };

  const resetTheme = () => {
    const defaultTheme = {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280'
    };
    setCustomTheme(defaultTheme);
    if (previewMode) {
      onThemeChange(defaultTheme);
    }
  };

  const exportTheme = () => {
    const themeData = {
      name: 'Mon thème personnalisé',
      colors: customTheme,
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme-personnalise.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target.result);
        if (themeData.colors) {
          setCustomTheme(themeData.colors);
          if (previewMode) {
            onThemeChange(themeData.colors);
          }
        }
      } catch (error) {
        console.error('Erreur import thème:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="text-purple-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Personnaliser le thème</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePreview}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              previewMode 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Eye size={16} className="mr-2" />
            Aperçu
          </button>
          
          {previewMode && (
            <button
              onClick={saveTheme}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save size={16} className="mr-2" />
              Appliquer
            </button>
          )}
        </div>
      </div>

      {/* Palettes prédéfinies */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Palettes prédéfinies</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {colorPalettes.map((palette, index) => (
            <motion.button
              key={index}
              onClick={() => applyPalette(palette)}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex space-x-1 mb-2">
                {Object.values(palette.colors).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {palette.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Personnalisation des couleurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(customTheme).map(([colorType, color]) => (
          <div key={colorType}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {colorType === 'primary' ? 'Couleur principale' :
               colorType === 'secondary' ? 'Couleur secondaire' :
               colorType === 'accent' ? 'Couleur d\'accent' :
               colorType === 'background' ? 'Arrière-plan' :
               colorType === 'surface' ? 'Surface' :
               colorType === 'text' ? 'Texte principal' :
               'Texte secondaire'}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(colorType, e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleColorChange(colorType, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Aperçu du thème */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Aperçu</h4>
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: customTheme.background,
            borderColor: customTheme.secondary + '40'
          }}
        >
          <div 
            className="text-lg font-bold mb-2"
            style={{ color: customTheme.text }}
          >
            Titre principal
          </div>
          <div 
            className="text-sm mb-3"
            style={{ color: customTheme.textSecondary }}
          >
            Texte secondaire et description
          </div>
          <div className="flex space-x-2">
            <div
              className="px-3 py-1 rounded text-white text-sm font-medium"
              style={{ backgroundColor: customTheme.primary }}
            >
              Bouton principal
            </div>
            <div
              className="px-3 py-1 rounded text-white text-sm font-medium"
              style={{ backgroundColor: customTheme.accent }}
            >
              Bouton accent
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={resetTheme}
          className="flex items-center px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Réinitialiser
        </button>
        
        <button
          onClick={exportTheme}
          className="flex items-center px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download size={16} className="mr-2" />
          Exporter
        </button>
        
        <label className="flex items-center px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
          <Upload size={16} className="mr-2" />
          Importer
          <input
            type="file"
            accept=".json"
            onChange={importTheme}
            className="hidden"
          />
        </label>
      </div>
    </motion.div>
  );
} 