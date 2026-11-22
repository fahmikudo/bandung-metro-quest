import { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveBmkgZoneForStop } from './bmkgZones';
import { fetchBmkgWeather, type BandungWeatherData } from './bmkgService';

export interface WeatherState {
  data: BandungWeatherData | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export function useBandungWeather(targetStopId?: string | null): WeatherState {
  const zone = useMemo(() => resolveBmkgZoneForStop(targetStopId), [targetStopId]);
  const [data, setData] = useState<BandungWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(false);

    fetchBmkgWeather(zone, controller.signal)
      .then((result) => {
        if (!active) return;
        if (result) {
          setData(result);
          setError(false);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [zone, attempt]);

  return { data, loading, error, retry };
}
