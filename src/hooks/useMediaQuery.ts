// Based on https://github.com/streamich/use-media
// simplified for initial implementation
// more research needed to identify best library for media queries, and to expand to be a global App feature in context
// Streamich has some good features, but maybe there is something better
import React, { DependencyList, EffectCallback } from 'react';

import { useState, useEffect, useLayoutEffect } from 'react';

export type Effect = (effect: EffectCallback, deps?: DependencyList) => void;

const createUseMedia = (effect: Effect) => (
    query: string,
    defaultState = false,
) => {
    const [state, setState] = useState(defaultState);

    effect(() => {
        let mounted = true;
        const mediaQueryList: MediaQueryList = window.matchMedia(query);

        const onChange = () => {
            if (!mounted) {
                return;
            }
            setState(Boolean(mediaQueryList.matches));
        };

        mediaQueryList.addListener(onChange);
        setState(mediaQueryList.matches);

        return () => {
            mounted = false;
            mediaQueryList.removeListener(onChange);
        };
    }, [query]);

    return state;
};

export const useMedia = createUseMedia(useEffect);
export const useMediaLayout = createUseMedia(useLayoutEffect);

export default useMedia;