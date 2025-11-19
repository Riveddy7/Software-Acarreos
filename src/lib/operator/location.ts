import { LocationData } from '@/models/types';

export class LocationTracker {
  private watchId: number | null = null;
  private lastLocation: LocationData | null = null;

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };

          this.lastLocation = locationData;
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Accept location cached for up to 1 minute
        }
      );
    });
  }

  /**
   * Start continuous location tracking
   */
  async startLocationTracking(): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    if (this.watchId !== null) {
      console.log('Location tracking is already active');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };

        this.lastLocation = locationData;
        console.log('Location updated:', locationData);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Accept location cached for up to 30 seconds
      }
    );
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('Location tracking stopped');
    }
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationData | null {
    return this.lastLocation;
  }

  /**
   * Check if location permission is granted
   */
  async validateLocationPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity
        }
      );
    });
  }

  /**
   * Request location permission (for iOS 13+)
   */
  async requestLocationPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      return false;
    }

    try {
      // Try to get location to trigger permission request
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      console.error('Location permission denied:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  calculateDistance(point1: LocationData, point2: LocationData): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if location is within specified radius of a target point
   */
  isLocationWithinRadius(
    currentLocation: LocationData,
    targetLocation: { latitude: number; longitude: number },
    radiusMeters: number
  ): boolean {
    const targetLocationData: LocationData = {
      latitude: targetLocation.latitude,
      longitude: targetLocation.longitude,
      accuracy: 0,
      timestamp: new Date()
    };

    const distance = this.calculateDistance(currentLocation, targetLocationData);
    return distance <= radiusMeters;
  }

  /**
   * Get location accuracy description
   */
  getAccuracyDescription(accuracy: number): string {
    if (accuracy < 10) return 'Excelente';
    if (accuracy < 50) return 'Buena';
    if (accuracy < 100) return 'Regular';
    return 'Pobre';
  }

  /**
   * Format location for display
   */
  formatLocation(location: LocationData): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  /**
   * Get location from IP address as fallback
   */
  async getLocationFromIP(): Promise<LocationData | null> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 10000, // IP-based location is very inaccurate
          timestamp: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get location from IP:', error);
      return null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopLocationTracking();
    this.lastLocation = null;
  }
}

// Export singleton instance
export const locationTracker = new LocationTracker();