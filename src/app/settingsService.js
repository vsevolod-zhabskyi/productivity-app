import { getDatabase, ref, set, child, get } from 'firebase/database';

/**
 * Settings service that is responsible for interaction
 * with the Firebase Realtime Database
 */
class SettingsService {
  /**
   * Resolves settings' config and value
   * @returns {Promise<Object>}
   */
  static getSettings() {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, 'settings')).then((snapshot) => {
      if (snapshot.exists()) {
        return Promise.resolve(snapshot.val());
      }
    });
  }

  /**
   * Resolves settings' value
   * @returns {Promise<Object>}
   */
  static getSettingsValue() {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, 'settings/value')).then((snapshot) => {
      if (snapshot.exists()) {
        return Promise.resolve(snapshot.val());
      }
    });
  }

  /**
   * Saves settings value to the server
   * @param {Object} settings
   * @returns {Promise<void>}
   */
  static writeSettings(settings) {
    const db = getDatabase();
    return set(ref(db, 'settings/value'), settings).catch((e) =>
      console.error(e)
    );
  }
}

export default SettingsService;
