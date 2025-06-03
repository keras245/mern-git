import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const SettingsHelp = ({ activeSection }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  const currentHelp = {
    items: [
      { title: 'Général', description: 'Cette section couvre les paramètres de base de l\'application.' },
      { title: 'Sécurité', description: 'Cette section couvre les paramètres de sécurité.' },
      { title: 'Notifications', description: 'Cette section couvre les paramètres de notification.' },
      { title: 'Apparence', description: 'Cette section couvre les paramètres d\'apparence.' },
      { title: 'Profil', description: 'Cette section couvre les paramètres de profil.' }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 relative"
    >
      {/* Items d'aide */}
      <div className="space-y-3">
        {currentHelp.items.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setExpandedItem(expandedItem === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{item.title}</span>
              <motion.div
                animate={{ rotate: expandedItem === index ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={16} className="text-gray-400" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {expandedItem === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3 mt-1">
                    {item.description}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Conseils généraux */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">💡 Conseils</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          {activeSection === 'general' && (
            <>
              <li>• Choisissez le bon fuseau horaire pour éviter les confusions d'horaires</li>
              <li>• La taille de page affecte les performances : plus petit = plus rapide</li>
              <li>• Gardez un nom d'application reconnaissable par vos utilisateurs</li>
            </>
          )}
          
          {activeSection === 'security' && (
            <>
              <li>• Un timeout court améliore la sécurité mais peut être contraignant</li>
              <li>• Activez la 2FA pour une sécurité maximale</li>
              <li>• La liste blanche IP est recommandée en production</li>
              <li>• Changez régulièrement votre mot de passe</li>
            </>
          )}
          
          {activeSection === 'notifications' && (
            <>
              <li>• Configurez une adresse email valide pour recevoir les alertes</li>
              <li>• Les heures de silence évitent les notifications nocturnes</li>
              <li>• Mode "quotidien" recommandé pour éviter le spam</li>
            </>
          )}
          
          {activeSection === 'appearance' && (
            <>
              <li>• Le mode automatique s'adapte à l'heure de la journée</li>
              <li>• Les couleurs sombres fatiguent moins les yeux</li>
              <li>• Désactivez les animations sur les appareils lents</li>
            </>
          )}
          
          {activeSection === 'profile' && (
            <>
              <li>• Utilisez une photo professionnelle et récente</li>
              <li>• Gardez vos informations de contact à jour</li>
              <li>• La biographie aide les autres à vous identifier</li>
            </>
          )}
        </ul>
      </div>

      {/* Raccourcis clavier */}
      {activeSection === 'general' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">⌨️ Raccourcis clavier</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Sauvegarder</span>
              <kbd className="px-2 py-1 bg-blue-200 rounded text-xs">Ctrl + S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Annuler</span>
              <kbd className="px-2 py-1 bg-blue-200 rounded text-xs">Ctrl + Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>Aide</span>
              <kbd className="px-2 py-1 bg-blue-200 rounded text-xs">F1</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">🚀 Actions rapides</h4>
        <div className="space-y-2">
          {activeSection === 'security' && (
            <button className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              <div className="font-medium text-red-900">Changer le mot de passe</div>
              <div className="text-sm text-red-700">Modifier votre mot de passe actuel</div>
            </button>
          )}
          
          {activeSection === 'profile' && (
            <button className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <div className="font-medium text-green-900">Mettre à jour la photo</div>
              <div className="text-sm text-green-700">Changer votre avatar</div>
            </button>
          )}
          
          <button className="w-full text-left p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Réinitialiser la section</div>
            <div className="text-sm text-gray-700">Remettre les valeurs par défaut</div>
          </button>
        </div>
      </div>

      {/* Support */}
      <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">🆘 Besoin d'aide ?</h4>
        <p className="text-sm text-orange-800 mb-3">
          Si vous rencontrez des problèmes avec ces paramètres, contactez le support technique.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-orange-700">
            <span className="w-16">Email :</span>
            <span className="font-mono">support@nongo.edu.gn</span>
          </div>
          <div className="flex items-center text-orange-700">
            <span className="w-16">Tél :</span>
            <span className="font-mono">+224 123 456 789</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsHelp; 