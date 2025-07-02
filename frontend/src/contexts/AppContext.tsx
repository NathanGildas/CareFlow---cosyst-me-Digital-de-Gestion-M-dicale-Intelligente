// src/contexts/AppContext.tsx - Contexte global de l'application
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { referentialsService, type Specialty, type Region, type City } from "../services/referentials.service";

// ===== TYPES =====

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'wo'; // Français, Anglais, Wolof
  currency: 'XOF' | 'EUR' | 'USD';
  timeZone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointments: boolean;
    insurance: boolean;
    system: boolean;
  };
}

interface AppData {
  specialties: Specialty[];
  regions: Region[];
  cities: City[];
  establishmentTypes: Array<{ value: string; label: string }>;
  insuranceTypes: Array<{ value: string; label: string }>;
  appointmentTypes: Array<{ value: string; label: string }>;
  paymentMethods: Array<{ value: string; label: string }>;
}

interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  settings: AppSettings;
  data: AppData;
  error: string | null;
  lastDataUpdate: string | null;
  networkStatus: 'online' | 'offline' | 'slow';
}

interface AppContextType extends AppState {
  // Actions pour les paramètres
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Actions pour les données
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Helpers
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  translate: (key: string, params?: Record<string, string>) => string;
  
  // Utilitaires
  getSpecialtyById: (id: string) => Specialty | undefined;
  getRegionById: (id: string) => Region | undefined;
  getCityById: (id: string) => City | undefined;
  getCitiesByRegion: (regionId: string) => City[];
  
  // Notifications
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearError: () => void;
}

// ===== CONSTANTES =====

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'fr',
  currency: 'XOF',
  timeZone: 'Africa/Dakar',
  dateFormat: 'DD/MM/YYYY',
  notifications: {
    email: true,
    sms: true,
    push: true,
    appointments: true,
    insurance: true,
    system: false,
  },
};

const DEFAULT_DATA: AppData = {
  specialties: [],
  regions: [],
  cities: [],
  establishmentTypes: [
    { value: 'HOSPITAL', label: 'Hôpital' },
    { value: 'CLINIC', label: 'Clinique' },
    { value: 'MEDICAL_CENTER', label: 'Centre médical' },
    { value: 'PHARMACY', label: 'Pharmacie' },
  ],
  insuranceTypes: [
    { value: 'BASIC', label: 'Essentiel' },
    { value: 'STANDARD', label: 'Confort' },
    { value: 'PREMIUM', label: 'Premium' },
    { value: 'FAMILY', label: 'Famille' },
  ],
  appointmentTypes: [
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'TELECONSULTATION', label: 'Téléconsultation' },
    { value: 'FOLLOWUP', label: 'Suivi' },
    { value: 'EMERGENCY', label: 'Urgence' },
    { value: 'SURGERY', label: 'Chirurgie' },
  ],
  paymentMethods: [
    { value: 'CASH', label: 'Espèces' },
    { value: 'CARD', label: 'Carte bancaire' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'INSURANCE', label: 'Assurance' },
    { value: 'BANK_TRANSFER', label: 'Virement' },
  ],
};

// ===== TRADUCTIONS =====

const TRANSLATIONS = {
  fr: {
    'app.loading': 'Chargement...',
    'app.error': 'Une erreur est survenue',
    'app.retry': 'Réessayer',
    'app.offline': 'Hors ligne',
    'currency.fcfa': 'FCFA',
    'date.today': "Aujourd'hui",
    'date.yesterday': 'Hier',
    'date.tomorrow': 'Demain',
  },
  en: {
    'app.loading': 'Loading...',
    'app.error': 'An error occurred',
    'app.retry': 'Retry',
    'app.offline': 'Offline',
    'currency.fcfa': 'CFA',
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.tomorrow': 'Tomorrow',
  },
  wo: {
    'app.loading': 'Dalal...',
    'app.error': 'Am na jumtukaay',
    'app.retry': 'Ceetal',
    'app.offline': 'Internet amul',
    'currency.fcfa': 'FCFA',
    'date.today': 'Tey',
    'date.yesterday': 'Démb',
    'date.tomorrow': 'Suba',
  },
};

// ===== CONTEXTE =====

const AppContext = createContext<AppContextType | undefined>(undefined);

// ===== PROVIDER =====

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    isLoading: true,
    settings: DEFAULT_SETTINGS,
    data: DEFAULT_DATA,
    error: null,
    lastDataUpdate: null,
    networkStatus: 'online',
  });

  // ===== INITIALISATION =====

  const initializeApp = useCallback(async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true, error: null }));

      // Charger les paramètres depuis le localStorage
      const savedSettings = localStorage.getItem('careflow_settings');
      let settings = DEFAULT_SETTINGS;
      
      if (savedSettings) {
        try {
          settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
        } catch (error) {
          console.warn('Erreur lors du chargement des paramètres:', error);
        }
      }

      // Charger les données de base
      let data = DEFAULT_DATA;
      const cachedData = localStorage.getItem('careflow_app_data');
      const cacheTimestamp = localStorage.getItem('careflow_app_data_timestamp');
      
      // Vérifier si le cache est encore valide (24 heures)
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
      const isCacheValid = cacheAge < 24 * 60 * 60 * 1000; // 24 heures

      if (cachedData && isCacheValid) {
        try {
          const parsedData = JSON.parse(cachedData);
          data = { ...DEFAULT_DATA, ...parsedData };
        } catch (error) {
          console.warn('Erreur lors du chargement du cache:', error);
        }
      }

      if (!isCacheValid) {
        // Charger les données fraîches depuis l'API
        try {
          const freshData = await referentialsService.preloadEssentialData();
          data = {
            ...DEFAULT_DATA,
            specialties: freshData.specialties,
            regions: freshData.regions,
            cities: freshData.cities,
          };

          // Mettre à jour le cache
          localStorage.setItem('careflow_app_data', JSON.stringify(data));
          localStorage.setItem('careflow_app_data_timestamp', Date.now().toString());
        } catch (error) {
          console.warn('Erreur lors du chargement des données:', error);
          // Continuer avec les données en cache ou par défaut
        }
      }

      setAppState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        settings,
        data,
        lastDataUpdate: cacheTimestamp || null,
      }));

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de l\'initialisation de l\'application',
      }));
    }
  }, []);

  // ===== EFFETS =====

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Détecter le statut réseau
  useEffect(() => {
    const handleOnline = () => setAppState(prev => ({ ...prev, networkStatus: 'online' }));
    const handleOffline = () => setAppState(prev => ({ ...prev, networkStatus: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Détection initiale
    setAppState(prev => ({ 
      ...prev, 
      networkStatus: navigator.onLine ? 'online' : 'offline' 
    }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ===== ACTIONS =====

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...appState.settings, ...newSettings };
    setAppState(prev => ({ ...prev, settings: updatedSettings }));
    localStorage.setItem('careflow_settings', JSON.stringify(updatedSettings));
  }, [appState.settings]);

  const resetSettings = useCallback(() => {
    setAppState(prev => ({ ...prev, settings: DEFAULT_SETTINGS }));
    localStorage.removeItem('careflow_settings');
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const freshData = await referentialsService.preloadEssentialData();
      const data = {
        ...DEFAULT_DATA,
        specialties: freshData.specialties,
        regions: freshData.regions,
        cities: freshData.cities,
      };

      // Mettre à jour le cache
      localStorage.setItem('careflow_app_data', JSON.stringify(data));
      localStorage.setItem('careflow_app_data_timestamp', Date.now().toString());

      setAppState(prev => ({
        ...prev,
        isLoading: false,
        data,
        lastDataUpdate: Date.now().toString(),
      }));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du rafraîchissement des données',
      }));
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem('careflow_app_data');
    localStorage.removeItem('careflow_app_data_timestamp');
    referentialsService.clearCache();
    setAppState(prev => ({
      ...prev,
      data: DEFAULT_DATA,
      lastDataUpdate: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setAppState(prev => ({ ...prev, error: null }));
  }, []);

  // ===== HELPERS =====

  const formatCurrency = useCallback((amount: number): string => {
    const { currency } = appState.settings;
    
    switch (currency) {
      case 'XOF':
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
      case 'EUR':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(amount);
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      default:
        return amount.toString();
    }
  }, [appState.settings]);

  const formatDate = useCallback((date: Date | string): string => {
    const { dateFormat, language } = appState.settings;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const locale = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'fr-FR';
    
    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString(locale);
      case 'MM/DD/YYYY':
        return dateObj.toLocaleDateString('en-US');
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      default:
        return dateObj.toLocaleDateString();
    }
  }, [appState.settings]);

  const translate = useCallback((key: string, params?: Record<string, string>): string => {
    const { language } = appState.settings;
    const translations = TRANSLATIONS[language] || TRANSLATIONS.fr;
    let translation = translations[key as keyof typeof translations] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  }, [appState.settings]);

  // ===== UTILITAIRES =====

  const getSpecialtyById = useCallback((id: string): Specialty | undefined => {
    return appState.data.specialties.find(s => s.id === id);
  }, [appState.data.specialties]);

  const getRegionById = useCallback((id: string): Region | undefined => {
    return appState.data.regions.find(r => r.id === id);
  }, [appState.data.regions]);

  const getCityById = useCallback((id: string): City | undefined => {
    return appState.data.cities.find(c => c.id === id);
  }, [appState.data.cities]);

  const getCitiesByRegion = useCallback((regionId: string): City[] => {
    return appState.data.cities.filter(c => c.regionId === regionId);
  }, [appState.data.cities]);

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    // Implémentation simple avec les notifications du navigateur
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CareFlow', {
        body: message,
        icon: '/favicon.ico',
      });
    }
    
    // Ou utiliser un système de notification interne
    window.dispatchEvent(new CustomEvent('app:notification', {
      detail: { message, type }
    }));
  }, []);

  // ===== VALEUR DU CONTEXTE =====

  const contextValue: AppContextType = {
    ...appState,
    updateSettings,
    resetSettings,
    refreshData,
    clearCache,
    formatCurrency,
    formatDate,
    translate,
    getSpecialtyById,
    getRegionById,
    getCityById,
    getCitiesByRegion,
    showNotification,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ===== HOOK =====

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// ===== EXPORTS =====

export { AppContext };
export type { AppSettings, AppData, AppState, AppContextType };