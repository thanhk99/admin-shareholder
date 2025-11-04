export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'UPCOMING' | 'PENDING' | 'COMPLETED';
  participants: string[];
  agenda: string[];
}