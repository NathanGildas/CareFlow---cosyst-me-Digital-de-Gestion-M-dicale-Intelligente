// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Vérification de l'environnement et configuration
const isDevelopment = import.meta.env.MODE === "development";
const isProduction = import.meta.env.MODE === "production";

// Configuration du debug en développement
if (isDevelopment) {
  console.log("🚀 CareFlow Frontend - Mode Développement");
  console.log("📡 API URL:", import.meta.env.VITE_API_URL);
  console.log("🔧 Debug activé:", import.meta.env.VITE_ENABLE_DEBUG);
}

// Gestion globale des erreurs non capturées
window.addEventListener("error", (event) => {
  console.error("❌ Erreur non capturée:", event.error);

  // En production, envoyer à un service de monitoring
  if (isProduction) {
    // Ici vous pourriez intégrer Sentry, LogRocket, etc.
    // Sentry.captureException(event.error);
  }
});

// Gestion des promesses rejetées
window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Promise rejetée:", event.reason);

  if (isProduction) {
    // Ici vous pourriez intégrer un service de monitoring
    // Sentry.captureException(event.reason);
  }
});

// Informations de l'application en développement
if (isDevelopment) {
  console.log(`
  🏥 CareFlow Sénégal Frontend
  📅 Version: ${import.meta.env.VITE_APP_VERSION || "1.0.0"}
  🌍 Environnement: ${import.meta.env.MODE}
  🔗 API: ${import.meta.env.VITE_API_URL}
  
  👨‍💻 Commandes utiles:
  - npm run dev        # Serveur de développement
  - npm run build      # Build de production
  - npm run type-check # Vérification TypeScript
  - npm run lint       # Linter ESLint
  `);
}

// Performance monitoring en développement
if (isDevelopment && "performance" in window) {
  // Observer les métriques Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === "measure") {
        console.log(`⏱️ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
      }
    });
  });

  observer.observe({ entryTypes: ["measure", "navigation"] });
}

// Vérification de la compatibilité du navigateur
const checkBrowserCompatibility = (): boolean => {
  const requiredFeatures = [
    "fetch",
    "Promise",
    "localStorage",
    "sessionStorage",
    "URL",
    "URLSearchParams",
  ];

  const missingFeatures = requiredFeatures.filter(
    (feature) => !(feature in window)
  );

  if (missingFeatures.length > 0) {
    console.error(
      "❌ Navigateur non compatible. Fonctionnalités manquantes:",
      missingFeatures
    );
    return false;
  }

  return true;
};

// Fonction de rendu principal
const renderApp = (): void => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("❌ Élément root non trouvé dans le DOM");
  }

  // Vérification de la compatibilité
  if (!checkBrowserCompatibility()) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: system-ui, sans-serif;
        background-color: #f9fafb;
        color: #374151;
        text-align: center;
        padding: 2rem;
      ">
        <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
          Navigateur Non Compatible
        </h1>
        <p style="margin-bottom: 2rem; max-width: 500px;">
          Votre navigateur ne supporte pas toutes les fonctionnalités requises pour CareFlow.
          Veuillez utiliser une version récente de Chrome, Firefox, Safari ou Edge.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
          "
        >
          Réessayer
        </button>
      </div>
    `;
    return;
  }

  // Créer la racine React
  const root = ReactDOM.createRoot(rootElement);

  // Rendu avec gestion d'erreurs
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    if (isDevelopment) {
      console.log("✅ Application CareFlow renderdue avec succès");
    }
  } catch (error) {
    console.error("❌ Erreur lors du rendu de l'application:", error);

    // Affichage d'une page d'erreur de fallback
    root.render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Erreur de Chargement
        </h1>
        <p style={{ marginBottom: "2rem", maxWidth: "500px" }}>
          Une erreur s'est produite lors du chargement de CareFlow. Veuillez
          rafraîchir la page ou contacter le support.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Rafraîchir la Page
        </button>
      </div>
    );
  }
};

// Configuration de l'application
const initializeApp = (): void => {
  // Configuration des métadonnées
  document.title = import.meta.env.VITE_APP_NAME || "CareFlow Sénégal";

  // Ajout des métadonnées viewport pour mobile
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(meta);
  }

  // Configuration PWA (si applicable)
  if ("serviceWorker" in navigator && isProduction) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("🔧 Service Worker enregistré:", registration);
        })
        .catch((error) => {
          console.error("❌ Erreur Service Worker:", error);
        });
    });
  }

  // Préchargement de ressources critiques
  const preloadCriticalResources = (): void => {
    // Précharger les polices importantes
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  };

  preloadCriticalResources();
};

// Point d'entrée principal
const main = (): void => {
  try {
    // Initialisation de l'application
    initializeApp();

    // Rendu de l'application
    renderApp();

    // Metrics de performance pour le monitoring
    if (isDevelopment) {
      // Mesurer le temps de rendu initial
      window.addEventListener("load", () => {
        const navigationTiming = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigationTiming) {
          const loadTime =
            navigationTiming.loadEventEnd - navigationTiming.fetchStart;
          console.log(`📊 Temps de chargement total: ${loadTime.toFixed(2)}ms`);

          const domContentLoaded =
            navigationTiming.domContentLoadedEventEnd -
            navigationTiming.fetchStart;
          console.log(
            `📊 DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms`
          );
        }
      });
    }
  } catch (error) {
    console.error("❌ Erreur fatale lors de l'initialisation:", error);

    // Fallback d'urgence
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: system-ui, sans-serif;
          background-color: #fef2f2;
          color: #991b1b;
          text-align: center;
          padding: 2rem;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">
            Erreur Fatale
          </h1>
          <p style="margin-bottom: 2rem; max-width: 500px;">
            Impossible de démarrer CareFlow. Veuillez vérifier votre connexion internet 
            et rafraîchir la page.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background-color: #dc2626;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
            "
          >
            Rafraîchir
          </button>
        </div>
      `;
    }
  }
};

// Démarrage de l'application
main();
