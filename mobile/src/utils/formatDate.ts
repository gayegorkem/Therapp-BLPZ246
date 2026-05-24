import { formatDistanceToNowStrict } from 'date-fns';
import { tr } from 'date-fns/locale';

export function relativeTime(iso: string): string {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: tr });
  } catch {
    return '';
  }
}

export function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
