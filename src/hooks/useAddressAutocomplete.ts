import { useState, useEffect, useCallback } from "react";
import { invokeFunction } from "@/lib/supabaseApi";

interface Suggestion {
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  importance: number;
}

export function useAddressAutocomplete(query: string, enabled = true) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3 || !enabled) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await invokeFunction('autocomplete', { query: searchQuery });
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  return { suggestions, isLoading };
}
