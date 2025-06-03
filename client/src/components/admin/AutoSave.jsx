import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, AlertCircle, Cloud } from 'lucide-react';

export default function AutoSave({ 
  data, 
  onSave, 
  interval = 30000, // 30 secondes par défaut
  enabled = true 
}) {
  const [lastSaved, setLastSaved] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'pending', 'saving', 'error'

  useEffect(() => {
    if (!enabled) return;

    setHasChanges(true);
    setSaveStatus('pending');

    const timer = setTimeout(async () => {
      if (hasChanges) {
        try {
          setSaving(true);
          setSaveStatus('saving');
          
          await onSave(data);
          
          setLastSaved(Date.now());
          setHasChanges(false);
          setSaveStatus('saved');
        } catch (error) {
          console.error('Erreur sauvegarde automatique:', error);
          setSaveStatus('error');
        } finally {
          setSaving(false);
        }
      }
    }, interval);

    return () => clearTimeout(timer);
  }, [data, enabled, interval, hasChanges, onSave]);

  const formatLastSaved = () => {
    const minutes = Math.floor((Date.now() - lastSaved) / 60000);
    if (minutes === 0) return 'À l\'instant';
    if (minutes === 1) return 'Il y a 1 minute';
    return `Il y a ${minutes} minutes`;
  };

  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: Save,
          text: 'Sauvegarde...',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'saved':
        return {
          icon: Check,
          text: `Sauvegardé ${formatLastSaved()}`,
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'pending':
        return {
          icon: Cloud,
          text: 'Modifications en attente',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erreur de sauvegarde',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        return {
          icon: Save,
          text: 'Prêt',
          color: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  if (!enabled) return null;

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusConfig.color} shadow-lg`}
      >
        <motion.div
          animate={{ 
            rotate: saving ? 360 : 0,
            scale: saveStatus === 'saved' ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 1, repeat: saving ? Infinity : 0, ease: "linear" },
            scale: { duration: 0.3 }
          }}
        >
          <Icon size={16} />
        </motion.div>
        <span className="text-sm font-medium">{statusConfig.text}</span>
      </motion.div>
    </AnimatePresence>
  );
} 