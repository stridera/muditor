import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewMode, ZoneMapData } from '../editor-types';

interface UseViewportModesParams {
  worldMapMode: boolean;
  zoneId?: number | null;
  fetchAllZones: () => Promise<ZoneMapData | null>;
  reactFlowInstance: {
    getViewport: () => { x: number; y: number; zoom: number };
    setCenter: (
      x: number,
      y: number,
      opts?: { zoom?: number; duration?: number }
    ) => void;
    fitView: (opts?: {
      padding?: number;
      minZoom?: number;
      maxZoom?: number;
      duration?: number;
    }) => void;
    setViewport: (
      vp: { x: number; y: number; zoom: number },
      opts?: { duration?: number }
    ) => void;
  } | null;
  router: { push: (url: string) => void };
  log: {
    info?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setZoneMapData: (data: ZoneMapData | null) => void;
  setAllZones: (
    zones: Array<{ id: number; name: string; climate: string }>
  ) => void;
}

interface UseViewportModesResult {
  currentViewMode: ViewMode;
  setCurrentViewMode: (m: ViewMode) => void;
  transitionToWorldMap: () => void;
  handleZoneSelect: (zoneId: number) => void;
  worldMapTransitionActive: boolean;
}

export function useViewportModes(
  params: UseViewportModesParams
): UseViewportModesResult {
  const {
    worldMapMode,
    zoneId,
    fetchAllZones,
    reactFlowInstance,
    router,
    log,
    setLoading,
    setError,
    setZoneMapData,
    setAllZones,
  } = params;

  const [currentViewMode, setCurrentViewMode] =
    useState<ViewMode>('room-detail');
  const viewModeTransitionRef = useRef<NodeJS.Timeout | null>(null);
  const worldMapTransitionRef = useRef<boolean>(false);
  // Placeholder for future custom zone transition logic retained from original file
  const customZoneTransitionDone = useRef<boolean>(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const lastViewportRef = useRef<{ x: number; y: number; zoom: number } | null>(
    null
  );
  const lastLODUpdate = useRef<number>(0);
  const LOD_THROTTLE_MS = 300;

  const detectViewMode = useCallback(
    (zoom: number, currentMode?: ViewMode): ViewMode => {
      if (currentMode === 'world-map') {
        if (zoom < 0.25) return 'world-map';
        if (zoom < 1.2) return 'zone-overview';
        return 'room-detail';
      } else if (currentMode === 'zone-overview') {
        if (zoom < 0.05) return 'world-map';
        if (zoom < 1.2) return 'zone-overview';
        return 'room-detail';
      } else {
        if (zoom < 0.1) return 'world-map';
        if (zoom < 1.2) return 'zone-overview';
        return 'room-detail';
      }
    },
    []
  );

  const handleZoneSelect = useCallback(
    (newZoneId: number) => {
      // In world map: zoom/navigate transitions
      if (worldMapMode || currentViewMode === 'world-map') {
        // Simple navigation; detailed centering logic stays here for now
        if (newZoneId !== zoneId) {
          router.push(`/dashboard/zones/editor?zone=${newZoneId}`);
        } else {
          setCurrentViewMode('zone-overview');
          if (reactFlowInstance) {
            setTimeout(() => {
              reactFlowInstance.fitView({
                padding: 0.2,
                minZoom: 0.15,
                maxZoom: 1.5,
                duration: 800,
              });
            }, 100);
          }
        }
        return;
      }
      if (newZoneId !== zoneId) {
        router.push(`/dashboard/zones/editor?zone=${newZoneId}`);
      }
    },
    [worldMapMode, currentViewMode, zoneId, router, reactFlowInstance]
  );

  const transitionToWorldMap = useCallback(() => {
    if (reactFlowInstance == null) return;
    worldMapTransitionRef.current = true;
    // Use stored zoneMapData if available else fetchAllZones()
    const perform = async () => {
      let mapData: ZoneMapData | null = null;
      setLoading(true);
      try {
        mapData = await fetchAllZones();
      } catch (e) {
        log.error?.('world-map:fetch-failed', e);
      } finally {
        setLoading(false);
      }
      if (!mapData) {
        worldMapTransitionRef.current = false;
        return;
      }
      setZoneMapData(mapData);
      setAllZones(
        mapData.zones.map(z => ({ id: z.id, name: z.name, climate: z.climate }))
      );
      const { globalBounds } = mapData;
      const ZONE_SCALE = 200;
      const centerX =
        ((globalBounds.minX + globalBounds.maxX) / 2) * ZONE_SCALE;
      const centerY =
        ((globalBounds.minY + globalBounds.maxY) / 2) * ZONE_SCALE;
      const worldWidth = (globalBounds.maxX - globalBounds.minX) * ZONE_SCALE;
      const worldHeight = (globalBounds.maxY - globalBounds.minY) * ZONE_SCALE;
      const containerWidth = 1200;
      const containerHeight = 800;
      const targetZoom = Math.min(
        containerWidth / (worldWidth + 400),
        containerHeight / (worldHeight + 400),
        0.2
      );
      reactFlowInstance.setCenter(centerX, centerY, {
        duration: 800,
        zoom: targetZoom,
      });
      setTimeout(() => {
        setCurrentViewMode('world-map');
        worldMapTransitionRef.current = false;
      }, 850);
    };
    perform();
  }, [
    reactFlowInstance,
    fetchAllZones,
    setAllZones,
    setZoneMapData,
    log,
    setLoading,
  ]);

  // Fetch data when entering explicit worldMapMode
  useEffect(() => {
    if (!worldMapMode) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const mapData = await fetchAllZones();
        if (!cancelled && mapData) {
          setZoneMapData(mapData);
          setAllZones(
            mapData.zones.map(z => ({
              id: z.id,
              name: z.name,
              climate: z.climate,
            }))
          );
        }
      } catch (e) {
        log.error?.('world-map:data-failed', e);
        setError('Failed to load world map data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    worldMapMode,
    fetchAllZones,
    setZoneMapData,
    setAllZones,
    log,
    setLoading,
    setError,
  ]);

  // Zoom-based mode changes
  useEffect(() => {
    if (!reactFlowInstance) return;
    const rf: unknown = reactFlowInstance;
    const maybeOn = (
      rf as {
        on?: (
          evt: string,
          cb: (vp: { x: number; y: number; zoom: number }) => void
        ) => () => void;
      }
    ).on;
    const unsub = maybeOn?.(
      'move',
      (viewport: { x: number; y: number; zoom: number }) => {
        const now = Date.now();
        if (
          lastViewportRef.current &&
          Math.abs(lastViewportRef.current.x - viewport.x) < 25 &&
          Math.abs(lastViewportRef.current.y - viewport.y) < 25
        ) {
          return;
        }
        if (worldMapTransitionRef.current) return;
        if (now - lastLODUpdate.current > LOD_THROTTLE_MS) {
          const newMode = detectViewMode(viewport.zoom, currentViewMode);
          if (newMode !== currentViewMode) {
            if (viewModeTransitionRef.current)
              clearTimeout(viewModeTransitionRef.current);
            viewModeTransitionRef.current = setTimeout(() => {
              setCurrentViewMode(newMode);
              viewModeTransitionRef.current = null;
            }, 100);
          }
          lastLODUpdate.current = now;
          lastViewportRef.current = viewport;
        }
      }
    );
    return () => {
      if (unsub && typeof unsub === 'function') unsub();
    };
  }, [reactFlowInstance, currentViewMode, detectViewMode]);

  return {
    currentViewMode,
    setCurrentViewMode,
    transitionToWorldMap,
    handleZoneSelect,
    worldMapTransitionActive: worldMapTransitionRef.current === true,
  };
}
