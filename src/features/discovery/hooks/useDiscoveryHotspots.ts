import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { DiscoveryHotspot } from '../../../types/discovery';

export const useDiscoveryHotspots = (pageId: string) => {
    const [hotspots, setHotspots] = useState<DiscoveryHotspot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchHotspots = async () => {
            setIsLoading(true);
            const { data } = await supabase
                .from('discovery_hotspots')
                .select('*')
                .eq('page_id', pageId);
            setHotspots(data || []);
            setIsLoading(false);
        };
        fetchHotspots();
    }, [pageId]);

    return { hotspots, isLoading };
};
