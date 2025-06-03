import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCompare, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsComparison({ 
  original, 
  current, 
  onRevert, 
  onApply,
  visible = true 
}) {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getChanges = () => {
    const changes = {};
    
    Object.keys(current).forEach(section => {
      const sectionChanges = {};
      const originalSection = original[section] || {};
      const currentSection = current[section] || {};
      
      Object.keys(currentSection).forEach(key => {
        const originalValue = originalSection[key];
        const currentValue = currentSection[key];
        
        // Gestion des objets imbriqués
        if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
          const nestedChanges = {};
          Object.keys(currentValue).forEach(nestedKey => {
            const originalNested = originalValue?.[nestedKey];
            const currentNested = currentValue[nestedKey];
            
            if (JSON.stringify(originalNested) !== JSON.stringify(currentNested)) {
              nestedChanges[nestedKey] = {
                original: originalNested,
                current: currentNested,
                type: originalNested === undefined ? 'added' : 
                      currentNested === undefined ? 'removed' : 'modified'
              };
            }
          });
          
          if (Object.keys(nestedChanges).length > 0) {
            sectionChanges[key] = {
              original: originalValue,
              current: currentValue,
              type: 'object',
              nested: nestedChanges
            };
          }
        } else if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
          sectionChanges[key] = {
            original: originalValue,
            current: currentValue,
            type: originalValue === undefined ? 'added' : 
                  currentValue === undefined ? 'removed' : 'modified'
          };
        }
      });
      
      if (Object.keys(sectionChanges).length > 0) {
        changes[section] = sectionChanges;
      }
    });
    
    return changes;
  };

  const changes = getChanges();
  const hasChanges = Object.keys(changes).length > 0;

  const formatValue = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return value.toString();
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'added': return Plus;
      case 'removed': return Minus;
      case 'modified': return Edit;
      default: return Edit;
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'added': return 'text-green-600 bg-green-50 border-green-200';
      case 'removed': return 'text-red-600 bg-red-50 border-red-200';
      case 'modified': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!visible || !hasChanges) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <GitCompare className="text-purple-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Aperçu des modifications</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {Object.values(changes).reduce((total, section) => total + Object.keys(section).length, 0)} changements
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOnlyChanges(!showOnlyChanges)}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              showOnlyChanges 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {showOnlyChanges ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="ml-2 text-sm">
              {showOnlyChanges ? 'Changements uniquement' : 'Tout afficher'}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(changes).map(([section, sectionChanges]) => (
          <div key={section} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: expandedSections.has(section) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} className="text-gray-400" />
                </motion.div>
                <span className="font-medium text-gray-900 capitalize">{section}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {Object.keys(sectionChanges).length} changements
                </span>
              </div>
            </button>
            
            <AnimatePresence>
              {expandedSections.has(section) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                    {Object.entries(sectionChanges).map(([field, change]) => {
                      const ChangeIcon = getChangeIcon(change.type);
                      const colorClass = getChangeColor(change.type);
                      
                      return (
                        <div key={field} className={`p-3 rounded-lg border ${colorClass}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <ChangeIcon size={14} />
                            <span className="font-medium capitalize">{field}</span>
                            <span className="text-xs opacity-75">({change.type})</span>
                          </div>
                          
                          {change.type === 'object' && change.nested ? (
                            <div className="space-y-2">
                              {Object.entries(change.nested).map(([nestedField, nestedChange]) => (
                                <div key={nestedField} className="ml-4 p-2 bg-white bg-opacity-50 rounded">
                                  <div className="font-medium text-sm">{nestedField}</div>
                                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                    <div>
                                      <div className="text-gray-500">Avant:</div>
                                      <code className="block bg-gray-100 p-1 rounded overflow-x-auto">
                                        {formatValue(nestedChange.original)}
                                      </code>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Après:</div>
                                      <code className="block bg-gray-100 p-1 rounded overflow-x-auto">
                                        {formatValue(nestedChange.current)}
                                      </code>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="text-gray-500 mb-1">Avant:</div>
                                <code className="block bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                                  {formatValue(change.original)}
                                </code>
                              </div>
                              <div>
                                <div className="text-gray-500 mb-1">Après:</div>
                                <code className="block bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                                  {formatValue(change.current)}
                                </code>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2 mt-3">
                            <button
                              onClick={() => onRevert && onRevert(section, field)}
                              className="px-2 py-1 text-xs bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                            >
                              Annuler ce changement
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Actions globales */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => onRevert && onRevert()}
          className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Tout annuler
        </button>
        <button
          onClick={() => onApply && onApply(changes)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Appliquer tous les changements
        </button>
      </div>
    </motion.div>
  );
} 