// src/hooks/useApi.ts - Hook personnalisé pour les appels API
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// ===== TYPES =====

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

interface UseApiOptions<T> {
  immediate?: boolean; // Exécuter automatiquement au montage
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  retries?: number; // Nombre de tentatives
  retryDelay?: number; // Délai entre les tentatives (ms)
  cache?: boolean; // Utiliser le cache
  cacheKey?: string; // Clé de cache personnalisée
  transform?: (data: any) => T; // Transformer les données
}

interface UseMutationOptions<T, V = any> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: string, variables: V) => void;
  onSettled?: (data: T | null, error: string | null, variables: V) => void;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== CACHE SIMPLE =====

const apiCache = new Map<string, { data: any; timestamp: number; expiry: number }>();

const getCachedData = (key: string): any | null => {
  const cached = apiCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttl: number = 5 * 60 * 1000): void => {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + ttl,
  });
};

// ===== HOOK PRINCIPAL =====

export function useApi<T = any>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseApiOptions<T>
): UseApiState<T> & {
  execute: () => Promise<T | null>;
  refetch: () => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retriesRef = useRef(0);

  const {
    immediate = false,
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
    cache = false,
    cacheKey,
    transform,
  } = options || {};

  const execute = useCallback(async (): Promise<T | null> => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau controller
    abortControllerRef.current = new AbortController();

    // Vérifier le cache
    const finalCacheKey = cacheKey || `${url}${JSON.stringify(config)}`;
    if (cache) {
      const cachedData = getCachedData(finalCacheKey);
      if (cachedData) {
        const transformedData = transform ? transform(cachedData) : cachedData;
        setState({
          data: transformedData,
          loading: false,
          error: null,
          isSuccess: true,
          isError: false,
        });
        onSuccess?.(transformedData);
        return transformedData;
      }
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isError: false,
    }));

    const attemptRequest = async (attempt: number): Promise<T | null> => {
      try {
        const response: AxiosResponse = await apiService.request({
          url,
          signal: abortControllerRef.current?.signal,
          ...config,
        });

        const responseData = response.data?.data || response.data;
        const transformedData = transform ? transform(responseData) : responseData;

        // Mettre en cache si nécessaire
        if (cache) {
          setCachedData(finalCacheKey, responseData);
        }

        setState({
          data: transformedData,
          loading: false,
          error: null,
          isSuccess: true,
          isError: false,
        });

        onSuccess?.(transformedData);
        retriesRef.current = 0; // Reset retries on success
        return transformedData;

      } catch (error: any) {
        // Ignorer les erreurs d'annulation
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          return null;
        }

        const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';

        // Tentative de retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          return attemptRequest(attempt + 1);
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          isSuccess: false,
          isError: true,
        });

        onError?.(errorMessage);
        return null;
      }
    };

    return attemptRequest(retriesRef.current);
  }, [url, config, cache, cacheKey, transform, onSuccess, onError, retries, retryDelay]);

  const refetch = useCallback(() => execute(), [execute]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  // Exécution automatique
  useEffect(() => {
    if (immediate) {
      execute();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refetch,
    reset,
  };
}

// ===== HOOK POUR LES MUTATIONS =====

export function useMutation<T = any, V = any>(
  mutationFn: (variables: V) => Promise<T>,
  options?: UseMutationOptions<T, V>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const { onSuccess, onError, onSettled } = options || {};

  const mutate = useCallback(async (variables: V): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isError: false,
    }));

    try {
      const data = await mutationFn(variables);

      setState({
        data,
        loading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      onSuccess?.(data, variables);
      onSettled?.(data, null, variables);
      return data;

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        isSuccess: false,
        isError: true,
      });

      onError?.(errorMessage, variables);
      onSettled?.(null, errorMessage, variables);
      return null;
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// ===== HOOK POUR LA PAGINATION =====

export function usePaginatedApi<T = any>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseApiOptions<PaginatedResponse<T>>
) {
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 20,
  });

  const finalConfig = {
    ...config,
    params: {
      ...config?.params,
      ...paginationParams,
    },
  };

  const { data, loading, error, isSuccess, isError, execute, refetch, reset } = useApi<PaginatedResponse<T>>(
    url,
    finalConfig,
    options
  );

  const setPage = useCallback((page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPaginationParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    setPaginationParams(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (data?.pagination?.hasNext) {
      setPage((data.pagination.page || 1) + 1);
    }
  }, [data?.pagination, setPage]);

  const prevPage = useCallback(() => {
    if (data?.pagination?.hasPrev) {
      setPage((data.pagination.page || 1) - 1);
    }
  }, [data?.pagination, setPage]);

  // Re-fetch when pagination params change
  useEffect(() => {
    if (isSuccess || isError) {
      execute();
    }
  }, [paginationParams]);

  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
    loading,
    error,
    isSuccess,
    isError,
    execute,
    refetch,
    reset,
    setPage,
    setLimit,
    setSort,
    nextPage,
    prevPage,
    paginationParams,
  };
}

// ===== HOOKS SPÉCIALISÉS =====

// Hook pour le chargement multiple
export function useMultipleApi<T extends Record<string, any>>(
  requests: Record<keyof T, { url: string; config?: AxiosRequestConfig }>,
  options?: { immediate?: boolean }
) {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    errors: Partial<Record<keyof T, string>>;
    isSuccess: boolean;
  }>({
    data: {},
    loading: false,
    errors: {},
    isSuccess: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, errors: {} }));

    const promises = Object.entries(requests).map(async ([key, request]) => {
      try {
        const response = await apiService.request(request);
        return { key, data: response.data?.data || response.data, error: null };
      } catch (error: any) {
        return { 
          key, 
          data: null, 
          error: error.response?.data?.message || error.message || 'Erreur' 
        };
      }
    });

    const results = await Promise.all(promises);
    
    const data: Partial<T> = {};
    const errors: Partial<Record<keyof T, string>> = {};
    
    results.forEach(({ key, data: resultData, error }) => {
      if (error) {
        errors[key as keyof T] = error;
      } else {
        data[key as keyof T] = resultData;
      }
    });

    setState({
      data,
      loading: false,
      errors,
      isSuccess: Object.keys(errors).length === 0,
    });
  }, [requests]);

  useEffect(() => {
    if (options?.immediate) {
      execute();
    }
  }, [options?.immediate, execute]);

  return {
    ...state,
    execute,
  };
}

// Hook pour les requêtes en temps réel
export function useRealtimeApi<T = any>(
  url: string,
  interval: number = 30000, // 30 secondes par défaut
  config?: AxiosRequestConfig,
  options?: UseApiOptions<T>
) {
  const { immediate = true, ...restOptions } = options || {};
  const apiHook = useApi(url, config, { ...restOptions, immediate });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (immediate) {
      intervalRef.current = setInterval(() => {
        apiHook.refetch();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [immediate, interval, apiHook.refetch]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      apiHook.refetch();
    }, interval);
  }, [interval, apiHook.refetch]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    ...apiHook,
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null,
  };
}

// ===== UTILITAIRES =====

export const clearApiCache = (): void => {
  apiCache.clear();
};

export const removeCachedData = (key: string): void => {
  apiCache.delete(key);
};

export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: apiCache.size,
    keys: Array.from(apiCache.keys()),
  };
};