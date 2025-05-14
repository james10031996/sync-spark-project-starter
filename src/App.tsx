
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChordProgressionPage from "./features/chord-progression";
import DrumMachinePage from "./features/drum-machine";
import { Helmet } from 'react-helmet';

// Create a client with cache configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Helmet>
        <title>Music Tools - Free Online Music Creation Tools</title>
        <meta name="description" content="Create music online with our free tools. Includes drum machine, chord progression player, and more tools for musicians and music producers." />
        <meta name="keywords" content="music tools, online music maker, free music tools, drum machine, chord progression, music production, songwriting tools, beat maker, online audio tools" />
        <meta property="og:title" content="Music Tools - Free Online Music Creation Tools" />
        <meta property="og:description" content="Create music online with our free tools. Includes drum machine, chord progression player, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://musictools.app" />
        <link rel="canonical" href="https://musictools.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Music Tools - Free Online Music Creation Tools" />
        <meta name="twitter:description" content="Create music online with our free tools. Includes drum machine, chord progression player, and more." />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Music Tools",
              "url": "https://musictools.app",
              "description": "Free online music creation tools including drum machine and chord progression player",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://musictools.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chord-player" element={<Navigate to="/chord-progression" replace />} />
          <Route path="/chord-progression" element={<ChordProgressionPage />} />
          <Route path="/drum-machine" element={<DrumMachinePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
