import { useMemo, useRef } from 'react';
import { Button, Tab, Tabs, useDisclosure } from '@heroui/react';
import { Compass, Database, Map as MapIcon, MessageCircle } from 'lucide-react';
import { RouteSearchCard } from '@/features/routing/components/RouteSearchCard';
import { RouteResultsList } from '@/features/routing/components/RouteResultsList';
import { MobileSearchBar } from '@/features/routing/components/MobileSearchBar';
import { MobileRouteCarousel } from '@/features/routing/components/MobileRouteCarousel';
import { TransitMapCard } from '@/features/map/components/TransitMapCard';
import { CorridorsExplorer } from '@/features/corridors/components/CorridorsExplorer';
import { DataSourcesModal } from '@/features/sources/components/DataSourcesModal';
import { useTransitStore } from '@/features/routing/store';
import { formatMinutesToHHMM, getCurrentWibMinutes } from '@/features/routing/schedule';
import type { ActiveTab } from '@/features/routing/schemas';
import { buildWhatsAppSupportUrl } from '@/shared/lib/contact';
import { trackEvent } from '@/shared/lib/analytics';
import { BandungHeaderBackdrop, ManawiLogoMark } from '@/shared/components/BandungHeaderArt';
import { InstallPwaButton } from '@/shared/components/InstallPwaButton';
import { useBandungWeather } from '@/features/weather/useBandungWeather';
import { WeatherAdvisoryBanner } from '@/features/weather/components/WeatherAdvisoryBanner';

function getSundaneseGreeting(wibMinutes: number): string {
  const hour = Math.floor(wibMinutes / 60);
  if (hour >= 4 && hour < 11) return '☀️ Wilujeng enjing, wargi Bandung!';
  if (hour >= 11 && hour < 15) return '🌤️ Wilujeng siang, wargi Bandung!';
  if (hour >= 15 && hour < 18) return '🌅 Wilujeng sonten, wargi Bandung!';
  return '🌙 Wilujeng wengi, wargi Bandung!';
}

export function App() {
  const activeTab = useTransitStore((s) => s.activeTab);
  const toId = useTransitStore((s) => s.toId);
  const setActiveTab = useTransitStore((s) => s.setActiveTab);
  const sourcesModal = useDisclosure();
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const waSupportUrl = buildWhatsAppSupportUrl();
  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherError,
    retry: retryWeather,
  } = useBandungWeather(toId);

  const { greeting, nowLabel } = useMemo(() => {
    const mins = getCurrentWibMinutes();
    return {
      greeting: getSundaneseGreeting(mins),
      nowLabel: `${formatMinutesToHHMM(mins)} WIB`,
    };
  }, []);

  const scrollToMapOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] pb-10">
      {/* Fun Bandung Sky Header (Biru Persib -> Biru Sky + Perbukitan & Jalur Transit) */}
      <header className="sticky top-0 z-30 overflow-hidden bg-gradient-to-br from-[#004AAD] via-[#0284C7] to-[#38BDF8] text-white shadow-md">
        <BandungHeaderBackdrop />

        <div className="relative z-10 mx-auto max-w-7xl space-y-2 px-3.5 py-2.5 sm:px-5 sm:py-3">
          {/* Greeting Bar */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-sky-50">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-0.5 backdrop-blur-xs">
              {greeting}
            </span>
            <span className="hidden rounded-full bg-[#002D6B]/30 px-2.5 py-0.5 text-sky-100 sm:inline">
              {nowLabel}
            </span>
          </div>

          {/* Brand & Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <ManawiLogoMark />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight">
                  Manawi<span className="text-[#FDE047]">Bandung</span>
                </h1>
                <p className="text-xs font-semibold italic text-sky-100">
                  bade kamana manawi?
                </p>
              </div>
            </div>

            <div className="flex w-full items-center sm:w-auto">
              <Tabs
                aria-label="Navigasi utama"
                size="sm"
                radius="full"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as ActiveTab)}
                classNames={{
                  base: 'w-full sm:w-auto',
                  tabList: 'w-full bg-[#002D6B]/30 p-1 backdrop-blur-xs sm:w-auto',
                  cursor: 'bg-white shadow-sm',
                  tab: 'font-extrabold text-xs px-4 h-8',
                  tabContent: 'text-sky-100 group-data-[selected=true]:text-[#004AAD]',
                }}
              >
                <Tab
                  key="planner"
                  title={
                    <span className="flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5" />
                      Cari Rute
                    </span>
                  }
                />
                <Tab
                  key="corridors"
                  title={
                    <span className="flex items-center gap-1.5">
                      <MapIcon className="h-3.5 w-3.5" />
                      56 Jalur
                    </span>
                  }
                />
              </Tabs>
            </div>
          </div>
        </div>
      </header>

      {/* Weather Vigilance Banner (BMKG) */}
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-5 sm:pt-4">
        <WeatherAdvisoryBanner
          data={weatherData}
          loading={weatherLoading}
          error={weatherError}
          onRetry={retryWeather}
        />
      </div>

      {/* Main Content */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-3.5 px-3 pt-3.5 sm:px-5 lg:grid-cols-[440px_1fr] lg:gap-5 lg:pt-5">
        {activeTab === 'planner' ? (
          <>
            {/* Mobile 1-Bar Search Pill */}
            <div className="order-1 lg:hidden">
              <MobileSearchBar />
            </div>

            {/* Desktop Full Search Card */}
            <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
              <RouteSearchCard />
            </div>

            {/* Interactive Simulation Map */}
            <section
              ref={mapSectionRef}
              className="order-2 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1"
            >
              <TransitMapCard />
            </section>

            {/* Mobile Swipeable Route Carousel */}
            <div className="order-3 lg:hidden">
              <MobileRouteCarousel onRequestScrollToMap={scrollToMapOnMobile} />
            </div>

            {/* Desktop Summary Cards List */}
            <div className="hidden lg:col-start-1 lg:row-start-2 lg:block">
              <RouteResultsList onRequestScrollToMap={scrollToMapOnMobile} />
            </div>
          </>
        ) : (
          <>
            <section
              ref={mapSectionRef}
              className="order-1 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1"
            >
              <TransitMapCard />
            </section>

            <div className="order-2 lg:col-start-1 lg:row-start-1">
              <CorridorsExplorer onSelectCorridorMobile={scrollToMapOnMobile} />
            </div>
          </>
        )}
      </main>

      {/* Warm Tactile Footer with WhatsApp Support & Data Sources */}
      <footer className="mx-auto mt-7 max-w-7xl px-3 sm:px-5">
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-sky-200/80 bg-white px-4 py-4 text-xs text-slate-600 shadow-[0_4px_0_rgba(0,74,173,0.07)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm">
              <strong className="font-extrabold text-[#004AAD]">ManawiBandung</strong> ·{' '}
              <span className="font-semibold italic text-slate-500">bade kamana manawi?</span>
            </p>
            <p className="mt-0.5 text-slate-600">
              Jika ada kendala / informasi rute atau tarif, silakan hubungi WhatsApp kami.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <InstallPwaButton />
            <Button
              as="a"
              href={waSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              color="success"
              variant="flat"
              radius="full"
              startContent={<MessageCircle className="h-4 w-4" />}
              onPress={() => trackEvent('whatsapp_support_clicked', { source: 'footer' })}
              className="h-9 bg-emerald-100 px-4 font-extrabold text-emerald-900 shadow-[0_3px_0_#a7f3d0] transition-transform active:translate-y-0.5"
            >
              Hubungi WA
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              radius="full"
              onPress={() => {
                trackEvent('data_sources_opened', { source: 'footer' });
                sourcesModal.onOpen();
              }}
              startContent={<Database className="h-3.5 w-3.5" />}
              className="h-9 bg-[#E8F4FF] px-4 font-extrabold text-[#004AAD] shadow-[0_3px_0_#bfdbfe] transition-transform active:translate-y-0.5"
            >
              Sumber Data
            </Button>
          </div>
        </div>
      </footer>

      <DataSourcesModal
        isOpen={sourcesModal.isOpen}
        onOpenChange={sourcesModal.onOpenChange}
      />
    </div>
  );
}

export default App;
