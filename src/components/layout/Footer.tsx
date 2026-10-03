import React from 'react';
import {
  MapPin,
  Phone,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';
import { useStudioData } from '../../context/StudioDataContext';

export const Footer: React.FC = () => {
  const { profile } = useStudioData();

  const studioName = profile?.studioName || 'Royal Studio';
  const description = profile?.description || profile?.tagline || 'Luxury wedding photography, cinematic films, and brand shoots.';
  const city = profile?.city || 'Burewala, Punjab, Pakistan';
  const address = profile?.address || 'Al Jannat Town Entrance, Canal Bungalow Road, Opposite Habib Mall, Burewala, Punjab 61010, Pakistan';
  const phone1 = profile?.phone || '0308-4877073';
  const phone2 = profile?.phone2 || '0303-2213806';
  const googleMapsUrl = profile?.googleMapsUrl || 'https://maps.app.goo.gl/mQPek7wm4nCVjy8o9';
  const facebookUrl = profile?.facebook || 'https://www.facebook.com/royalstudio089';
  const instagramUrl = profile?.instagram || 'https://www.instagram.com/royalstudio089';
  const youtubeUrl = profile?.youtube || 'https://www.youtube.com/@royalstudio089';
  const websiteUrl = profile?.website || 'https://royalstudio.online';

  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-gray-200 text-xs text-gray-600 bg-white/60 rounded-2xl px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Identity & Description */}
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-gray-900 tracking-tight">{studioName}</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-100 rounded-full">
              Official Profile
            </span>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-gray-500 pt-1 text-[11px]">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-amber-700 transition-colors font-medium text-gray-700"
              title="Open Royal Studio location in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{city}</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
            <span>•</span>
            <div className="inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <a href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} className="hover:text-amber-700 transition-colors font-medium">
                {phone1}
              </a>
              <span>|</span>
              <a href={`tel:${phone2.replace(/[^0-9+]/g, '')}`} className="hover:text-amber-700 transition-colors font-medium">
                {phone2}
              </a>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 pt-0.5 truncate" title={address}>
            {address}
          </div>
        </div>

        {/* Social Links & Google Maps Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {facebookUrl && (
              <a
                href={facebookUrl.startsWith('http') ? facebookUrl : `https://${facebookUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                title="Facebook: Royal Studio"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
                title="Instagram: Royal Studio"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {youtubeUrl && (
              <a
                href={youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                title="YouTube: Royal Studio"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 transition-colors"
                title="Website: royalstudio.online"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Google Maps</span>
            <ExternalLink className="w-3 h-3 text-amber-700" />
          </a>
        </div>
      </div>
    </footer>
  );
};
