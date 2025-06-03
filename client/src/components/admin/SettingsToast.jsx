import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Settings,
  Trash2
} from 'lucide-react';

export default function SettingsToast({ 
  notifications, 
  onDismiss, 
  onDismissAll,
  position = 'top-right' 
}) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHide !== false) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration || 4000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return Check;
      case 'error': return X;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'settings': return Settings;
      default: return Info;
    }
  };

  const getColorClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'settings':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 max-w-sm w-full`}>
      {/* Bouton tout effacer */}
      {notifications.length > 1 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onDismissAll}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <Trash2 size={14} />
          <span>Tout effacer ({notifications.length})</span>
        </motion.button>
      )}

      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const colorClasses = getColorClasses(notification.type);

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative p-4 rounded-lg border shadow-lg ${colorClasses} backdrop-blur-sm`}
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  initial={{ rotate: -90 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-shrink-0 p-1"
                >
                  <Icon size={20} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <h4 className="font-medium mb-1">{notification.title}</h4>
                  )}
                  <p className="text-sm opacity-90">{notification.message}</p>
                  
                  {notification.actions && (
                    <div className="flex space-x-2 mt-3">
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.handler();
                            onDismiss(notification.id);
                          }}
                          className="px-3 py-1 text-xs font-medium bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Barre de progression pour l'auto-hide */}
              {notification.autoHide !== false && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (notification.duration || 4000) / 1000, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 rounded-b-lg"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
} 