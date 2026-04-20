"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  price: string;
}

export function SearchBar({
  className,
  placeholder = "Search products...",
  autoFocus = false,
  value: externalValue,
  onChange: externalOnChange,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = externalValue !== undefined ? externalValue : internalValue;
  const setQuery = externalOnChange 
    ? (val: string) => externalOnChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)
    : setInternalValue;

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();
        setResults(data.products || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery("");
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setShowResults(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pr-20"
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-full px-2"
              onClick={clearSearch}
            >
              <X size={16} />
            </Button>
          )}
          <Button type="submit" size="icon" className="h-full rounded-l-none">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
          </Button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              <div className="p-2 text-xs font-medium text-muted-foreground uppercase">
                Products
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.slug)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={result.image_url}
                    alt={result.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm line-clamp-1">
                      {result.name}
                    </p>
                    <p className="text-sm text-primary">
                      ${parseFloat(result.price).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full p-2 text-sm text-primary hover:bg-muted/50 transition-colors border-t"
              >
                See all results for "{query}"
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No products found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
