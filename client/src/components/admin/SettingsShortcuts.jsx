import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Command } from 'lucide-react';

export default function SettingsShortcuts({ onAction, isVisible, onClose }) {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts = [
    {
      key: 'Ctrl + S',
      action: 'save',
      description: 'Sauvegarder la section active',
      category: 'Général'
    },
    {
      key: 'Ctrl + R',
      action: 'reset',
      description: 'Réinitialiser la section active',
      category: 'Général'
    },
    {
      key: 'Ctrl + H',
      action: 'help',
      description: 'Afficher/Masquer l\'aide',
      category: 'Général'
    },
    {
      key: 'Ctrl + E',
      action: 'export',
      description: 'Exporter les paramètres',
      category: 'Général'
    },
    {
      key: '1-5',
      action: 'switch-tab',
      description: 'Basculer entre les onglets',
      category: 'Navigation'
    },
    {
      key: 'Tab',
      action: 'next-field',
      description: 'Champ suivant',
      category: 'Navigation'
    },
    {
      key: 'Shift + Tab',
      action: 'prev-field',
      description: 'Champ précédent',
      category: 'Navigation'
    },
    {
      key: 'Escape',
      action: 'cancel',
      description: 'Annuler/Fermer',
      category: 'Navigation'
    },
    {
      key: 'Ctrl + Z',
      action: 'undo',
      description: 'Annuler la dernière action',
      category: 'Édition'
    },
    {
      key: 'Ctrl + Y',
      action: 'redo',
      description: 'Refaire l\'action annulée',
      category: 'Édition'
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event) => {
      const { ctrlKey, metaKey, key, shiftKey } = event;
      const isModifier = ctrlKey || metaKey;

      // Sauvegarder
      if (isModifier && key === 's') {
        event.preventDefault();
        onAction('save');
      }
      
      // Réinitialiser
      else if (isModifier && key === 'r') {
        event.preventDefault();
        onAction('reset');
      }
      
      // Aide
      else if (isModifier && key === 'h') {
        event.preventDefault();
        onAction('help');
      }
      
      // Export
      else if (isModifier && key === 'e') {
        event.preventDefault();
        onAction('export');
      }
      
      // Annuler
      else if (isModifier && key === 'z') {
        event.preventDefault();
        onAction('undo');
      }
      
      // Refaire
      else if (isModifier && key === 'y') {
        event.preventDefault();
        onAction('redo');
      }
      
      // Basculer entre onglets (1-5)
      else if (!isModifier && ['1', '2', '3', '4', '5'].includes(key)) {
        event.preventDefault();
        onAction('switch-tab', parseInt(key) - 1);
      }
      
      // Fermer/Annuler
      else if (key === 'Escape') {
        event.preventDefault();
        onAction('cancel');
      }
      
      // Afficher l'aide des raccourcis
      else if (key === 'F1') {
        event.preventDefault();
        setShowHelp(!showHelp);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onAction, showHelp]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {showHelp && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 z-51 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Keyboard className="text-purple-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Raccourcis clavier</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Shortcuts par catégorie */}
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{shortcut.description}</span>
                          <div className="flex items-center space-x-1">
                            {shortcut.key.split(' + ').map((key, keyIndex) => (
                              <span key={keyIndex} className="flex items-center">
                                {keyIndex > 0 && <span className="mx-1 text-gray-400">+</span>}
                                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-800 shadow-sm">
                                  {key === 'Ctrl' && navigator.platform.includes('Mac') ? (
                                    <Command size={12} />
                                  ) : (
                                    key
                                  )}
                                </kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Astuce :</strong> Appuyez sur <kbd className="px-2 py-1 bg-blue-200 rounded text-xs">F1</kbd> à tout moment pour afficher cette aide.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 