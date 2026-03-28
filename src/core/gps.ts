export interface GPSWatchHandle {
  watchId: number;
  stop: () => void;
}

export interface GPSRawUpdate {
  x: number;
  y: number;
  accuracy: number;
}

export function startGPS(
  onUpdate: (position: GPSRawUpdate) => void
): GPSWatchHandle | null {
  if (!("geolocation" in navigator)) {
    console.error("Geolocation not supported");
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      console.log("GPS:", latitude, longitude);

      // ตอนนี้ใช้ lat/long เป็น x/y ไปก่อน (mock mapping)
      onUpdate({
        x: latitude,
        y: longitude,
        accuracy,
      });
    },
    (err) => {
      console.error("GPS Error:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  );

  return {
    watchId,
    stop: () => {
      navigator.geolocation.clearWatch(watchId);
    },
  };
}

// Request only motion/gyro permission (iOS requires user gesture).
export async function requestMotionPermission() {
  const DeviceOrientationEventCtor = (window as any).DeviceOrientationEvent;
  if (DeviceOrientationEventCtor?.requestPermission) {
    try {
      const result = await DeviceOrientationEventCtor.requestPermission();
      if (result !== "granted") {
        throw new Error(`Orientation permission: ${result}`);
      }
    } catch (err) {
      console.warn("Gyro permission was not granted", err);
    }
  }

  const DeviceMotionEventCtor = (window as any).DeviceMotionEvent;
  if (DeviceMotionEventCtor?.requestPermission) {
    try {
      const result = await DeviceMotionEventCtor.requestPermission();
      if (result !== "granted") {
        throw new Error(`Motion permission: ${result}`);
      }
    } catch (err) {
      console.warn("Motion permission was not granted", err);
    }
  }
}

// Request only location permission (geolocation).
export async function requestLocationPermission() {
  if (!("geolocation" in navigator)) {
    return;
  }

  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 8000,
  } as const;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    let watchId: number | undefined;

    try {
      watchId = navigator.geolocation.watchPosition(
        () => {
          if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
          finish();
        },
        (err) => {
          console.warn("Location watch permission was not granted", err);
          if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
          finish();
        },
        options
      );
    } catch (err) {
      console.warn("Location watch threw", err);
      finish();
    }

    try {
      navigator.geolocation.getCurrentPosition(
        () => {
          if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
          finish();
        },
        (err) => {
          console.warn("Location permission was not granted", err);
          if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
          finish();
        },
        options
      );
    } catch (err) {
      console.warn("Location getCurrentPosition threw", err);
      finish();
    }

    setTimeout(() => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      finish();
    }, 9000);
  });
}