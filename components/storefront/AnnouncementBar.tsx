import { getSiteSettings } from '@/lib/settings/settings.service';

export async function AnnouncementBar() {
  const settings = await getSiteSettings();
  if (!settings.announcementText) return null;

  return (
    <div className="bg-midnight px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      {settings.announcementText}
    </div>
  );
}
