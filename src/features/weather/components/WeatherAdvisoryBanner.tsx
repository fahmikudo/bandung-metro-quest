import { Button, Card, CardBody } from '@heroui/react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  RefreshCw,
  Sun,
} from 'lucide-react';
import type {
  BandungWeatherData,
  WeatherAdvisoryTone,
  WeatherConditionKind,
} from '../bmkgService';

function WeatherGlyph({
  kind,
  className = 'h-4 w-4',
}: {
  kind: WeatherConditionKind;
  className?: string;
}) {
  switch (kind) {
    case 'storm':
      return <CloudLightning className={className} />;
    case 'rain':
      return <CloudRain className={className} />;
    case 'hot':
    case 'clear':
      return <Sun className={className} />;
    case 'cold_fog':
      return <CloudFog className={className} />;
    default:
      return <Cloud className={className} />;
  }
}

const TONE_STYLES: Record<
  WeatherAdvisoryTone,
  {
    card: string;
    iconBox: string;
    headline: string;
    badge: string;
  }
> = {
  danger: {
    card: 'border-rose-200 bg-rose-50/90 shadow-[0_3px_0_rgba(225,29,72,0.08)]',
    iconBox: 'bg-rose-600 text-white',
    headline: 'text-rose-950',
    badge: 'bg-rose-100 text-rose-800',
  },
  warning: {
    card: 'border-amber-200 bg-amber-50/90 shadow-[0_3px_0_rgba(245,158,11,0.10)]',
    iconBox: 'bg-[#FACC15] text-[#422006]',
    headline: 'text-amber-950',
    badge: 'bg-amber-200/75 text-amber-950',
  },
  info: {
    card: 'border-sky-200 bg-[#E8F4FF]/85 shadow-[0_3px_0_rgba(0,74,173,0.08)]',
    iconBox: 'bg-[#004AAD] text-white',
    headline: 'text-slate-900',
    badge: 'bg-white/90 text-[#004AAD]',
  },
  success: {
    card: 'border-emerald-200/90 bg-emerald-50/80 shadow-[0_3px_0_rgba(5,150,105,0.07)]',
    iconBox: 'bg-emerald-600 text-white',
    headline: 'text-emerald-950',
    badge: 'bg-emerald-100 text-emerald-900',
  },
};

interface WeatherAdvisoryBannerProps {
  data: BandungWeatherData | null;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function WeatherAdvisoryBanner({
  data,
  loading = false,
  error = false,
  onRetry,
}: WeatherAdvisoryBannerProps) {
  if (!data && loading) {
    return (
      <Card
        shadow="none"
        className="w-full rounded-2xl border-2 border-sky-200/80 bg-white/90 shadow-[0_3px_0_rgba(0,74,173,0.05)]"
      >
        <CardBody className="flex flex-row items-center gap-3 px-3.5 py-2.5">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-sky-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-40 animate-pulse rounded-full bg-sky-100" />
            <div className="h-2.5 w-60 max-w-full animate-pulse rounded-full bg-slate-100" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    if (!error) return null;
    return (
      <Card
        shadow="none"
        className="w-full rounded-2xl border-2 border-sky-200/80 bg-white shadow-[0_3px_0_rgba(0,74,173,0.05)]"
      >
        <CardBody className="flex flex-row flex-wrap items-center justify-between gap-2 px-3.5 py-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Cloud className="h-4 w-4 shrink-0 text-[#004AAD]" />
            <span>Cuaca BMKG belum termuat.</span>
          </div>
          {onRetry && (
            <Button
              size="sm"
              radius="full"
              variant="flat"
              color="primary"
              onPress={onRetry}
              startContent={<RefreshCw className="h-3 w-3" />}
              className="h-7 bg-[#E8F4FF] px-3 text-xs font-extrabold text-[#004AAD]"
            >
              Muat Ulang
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  const { current, advisory, zone } = data;
  const style = TONE_STYLES[advisory.tone];
  const windAlert =
    current.windSpeedKmh >= 20
      ? ` · Waspada angin kencang (${Math.round(current.windSpeedKmh)} km/jam)`
      : '';

  return (
    <Card shadow="none" className={`w-full rounded-2xl border-2 ${style.card}`}>
      <CardBody className="flex flex-row items-center gap-3 px-3.5 py-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${style.iconBox}`}
        >
          <WeatherGlyph kind={advisory.kind} className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            <span className={`text-xs font-extrabold tabular-nums sm:text-[13px] ${style.headline}`}>
              {current.tempC}°C · {current.weatherDesc}{' '}
              <span className="font-semibold opacity-80">di {zone.label}</span>
            </span>
            <a
              href="https://data.bmkg.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide hover:underline ${style.badge}`}
            >
              BMKG
            </a>
          </div>
          <p className="mt-0.5 text-xs font-semibold leading-snug text-slate-700">
            {advisory.shortTip}
            {windAlert}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
