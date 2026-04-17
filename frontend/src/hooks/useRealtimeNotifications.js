import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook for WebSocket-based real-time notifications
 * Supports fallback to polling if WebSocket is not available
 * @param {string} userId - User ID for subscribing to notifications
 * @param {Object} options - Configuration options
 * @param {string} options.wsUrl - WebSocket URL (default: from env or localhost:5000)
 * @param {boolean} options.useFallback - Use polling fallback (default: true)
 * @param {number} options.fallbackInterval - Polling interval in ms (default: 30000)
 * @returns {Object} Real-time notification state and methods
 */
export function useRealtimeNotifications(userId, options = {}) {
  const {
    wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:5000",
    useFallback = true,
    fallbackInterval = 30000,
  } = options;

  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Establish WebSocket connection
  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(`${wsUrl}/notifications`);

      socket.onopen = () => {
        console.log("WebSocket connected for notifications");
        setConnected(true);
        setError(null);

        // Subscribe to user notifications
        socket.send(
          JSON.stringify({
            action: "subscribe",
            userId,
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);

          if (notification.action === "notification") {
            setNotifications((prev) => [notification.data, ...prev]);
          } else if (notification.action === "notification-update") {
            setNotifications((prev) =>
              prev.map((n) =>
                n._id === notification.data._id ? notification.data : n
              )
            );
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError(err);
        if (useFallback) {
          console.log("Falling back to polling");
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        if (useFallback) {
          // Attempt to reconnect after delay
          setTimeout(() => connect(), 5000);
        }
      };

      return socket;
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err);
      setError(err);
      return null;
    }
  }, [userId, wsUrl, useFallback]);

  // Set up connection and cleanup
  useEffect(() => {
    if (!userId) return;

    const socket = connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [userId, connect]);

  return {
    connected,
    notifications,
    error,
  };
}

/**
 * Hook to manage notification subscriptions
 * Subscribe to specific notification types or users
 * @param {Object} subscriptions - Subscription configuration
 * @param {string[]} subscriptions.types - Types to subscribe to
 * @param {string[]} subscriptions.userIds - User IDs to listen for
 * @param {Object} options - Connection options
 * @returns {Object} Subscription state and methods
 */
export function useNotificationSubscription(subscriptions = {}, options = {}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedTo, setSubscribedTo] = useState(subscriptions);

  const subscribe = useCallback(
    (newSubscriptions) => {
      setSubscribedTo((prev) => ({
        ...prev,
        ...newSubscriptions,
      }));
      setIsSubscribed(true);
    },
    []
  );

  const unsubscribe = useCallback(
    (keysToRemove) => {
      setSubscribedTo((prev) => {
        const updated = { ...prev };
        keysToRemove.forEach((key) => {
          delete updated[key];
        });
        return updated;
      });
      setIsSubscribed(Object.keys(subscribedTo).length > 0);
    },
    [subscribedTo]
  );

  const clearSubscriptions = useCallback(() => {
    setSubscribedTo({});
    setIsSubscribed(false);
  }, []);

  return {
    isSubscribed,
    subscribedTo,
    subscribe,
    unsubscribe,
    clearSubscriptions,
  };
}

/**
 * Hook to handle notification sounds and alerts
 * Plays sound when new notification arrives
 * @param {boolean} enabled - Enable sound notifications
 * @param {string} soundUrl - URL to notification sound file
 * @returns {Object} Sound control methods
 */
export function useNotificationSound(
  enabled = false,
  soundUrl = "/sounds/notification.mp3"
) {
  const audioRef = new Audio(soundUrl);

  const playSound = useCallback(() => {
    if (enabled) {
      try {
        audioRef.play().catch((err) =>
          console.warn("Failed to play notification sound:", err)
        );
      } catch (err) {
        console.error("Error playing sound:", err);
      }
    }
  }, [enabled, audioRef]);

  const stopSound = useCallback(() => {
    audioRef.pause();
    audioRef.currentTime = 0;
  }, [audioRef]);

  return {
    playSound,
    stopSound,
  };
}

/**
 * Hook to request browser notification permission and send notifications
 * @param {boolean} enabled - Enable browser notifications
 * @returns {Object} Notification methods
 */
export function useBrowserNotifications(enabled = false) {
  const [permission, setPermission] = useState(
    Notification?.permission || "default"
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (err) {
      console.error("Failed to request notification permission:", err);
      return false;
    }
  }, [permission]);

  const sendNotification = useCallback(
    (title, options = {}) => {
      if (!enabled || permission !== "granted") {
        return;
      }

      try {
        new Notification(title, {
          icon: "/icons/notification-icon.png",
          badge: "/icons/badge.png",
          ...options,
        });
      } catch (err) {
        console.error("Failed to send browser notification:", err);
      }
    },
    [enabled, permission]
  );

  return {
    permission,
    requestPermission,
    sendNotification,
  };
}
