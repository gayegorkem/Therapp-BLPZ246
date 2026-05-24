export type EmergencyResource = {
  name: string;
  description: string;
  phone?: string;
  url?: string;
};

export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    name: 'Acil Çağrı Merkezi',
    description: 'Her türlü acil durum için 7/24 ulaşılabilir',
    phone: '112',
  },
  {
    name: 'İntihar Önleme Hattı',
    description: 'Ruhsal kriz anlarında destek hattı',
    phone: '182',
  },
  {
    name: 'KADES — Kadın Destek Uygulaması',
    description: 'Şiddete maruz kalan kadınlar için acil bildirim',
    url: 'https://kades.gov.tr',
  },
];
